import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { chunksService } from "@/services/chunks";
import { recordingsService } from "@/services/recordings";
import { booksService } from "@/services/books";
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Chunk, Book } from "@/types";

export default function RecordBook() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (bookId) {
      loadBookData();
      loadChunks();
    }
  }, [bookId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  const loadBookData = async () => {
    try {
      const bookData = await booksService.getBook(parseInt(bookId!));
      setBook(bookData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load book",
        variant: "destructive",
      });
    }
  };

  const loadChunks = async () => {
    try {
      const response = await chunksService.getBookChunks(parseInt(bookId!), 0, 1000);
      setChunks(response.items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chunks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleUpload = async () => {
    if (!audioBlob || !chunks[currentChunkIndex]) return;

    setUploading(true);
    try {
      const file = new File([audioBlob], `recording-${Date.now()}.wav`, { type: "audio/wav" });
      await recordingsService.uploadRecording(chunks[currentChunkIndex].id, file);

      toast({
        title: "Success",
        description: "Recording uploaded successfully",
      });

      // Mark chunk as recorded
      const updatedChunks = [...chunks];
      updatedChunks[currentChunkIndex].is_recorded = true;
      setChunks(updatedChunks);

      // Clear current recording and move to next chunk
      clearRecording();
      if (currentChunkIndex < chunks.length - 1) {
        setCurrentChunkIndex(currentChunkIndex + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload recording",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  const goToPreviousChunk = () => {
    if (currentChunkIndex > 0) {
      clearRecording();
      setCurrentChunkIndex(currentChunkIndex - 1);
    }
  };

  const goToNextChunk = () => {
    if (currentChunkIndex < chunks.length - 1) {
      clearRecording();
      setCurrentChunkIndex(currentChunkIndex + 1);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentChunk = chunks[currentChunkIndex];
  const recordedCount = chunks.filter((c) => c.is_recorded).length;
  const progress = (recordedCount / chunks.length) * 100;

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => navigate("/")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to My Books
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{book?.title}</h1>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Progress: {recordedCount} / {chunks.length} chunks
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {currentChunk && (
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-mono bg-muted px-3 py-1 rounded">
                  #{currentChunk.order_index} of {chunks.length}
                </span>
                {currentChunk.is_recorded && (
                  <div className="flex items-center gap-2 text-recorded text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Recorded</span>
                  </div>
                )}
              </div>

              <div className="bg-muted p-6 rounded-lg mb-8">
                <p className="text-lg leading-relaxed text-foreground">{currentChunk.text}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  {!isRecording && !audioBlob && (
                    <Button onClick={startRecording} size="lg" className="gap-2">
                      <Mic className="h-5 w-5" />
                      Start Recording
                    </Button>
                  )}

                  {isRecording && (
                    <Button onClick={stopRecording} size="lg" variant="destructive" className="gap-2">
                      <Square className="h-5 w-5" />
                      Stop Recording
                    </Button>
                  )}

                  {audioBlob && !isRecording && (
                    <>
                      <Button onClick={togglePlayback} size="lg" variant="secondary" className="gap-2">
                        {isPlaying ? (
                          <>
                            <Pause className="h-5 w-5" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5" />
                            Play
                          </>
                        )}
                      </Button>
                      <Button onClick={clearRecording} size="lg" variant="outline">
                        Re-record
                      </Button>
                      <Button
                        onClick={handleUpload}
                        size="lg"
                        className="gap-2"
                        disabled={uploading}
                      >
                        <Upload className="h-5 w-5" />
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                    </>
                  )}
                </div>

                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-recording">
                    <div className="h-3 w-3 bg-recording rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Recording in progress...</span>
                  </div>
                )}

                {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousChunk}
            disabled={currentChunkIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={goToNextChunk}
            disabled={currentChunkIndex === chunks.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
