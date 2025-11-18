import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { assignmentsService } from "@/services/assignments";
import { BookOpen, ArrowRight } from "lucide-react";
import type { SpeakerWithBooks } from "@/types";

export default function SpeakerBooks() {
  const { user } = useAuth();
  const [speakerData, setSpeakerData] = useState<SpeakerWithBooks | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    try {
      const data = await assignmentsService.getSpeakerBooks(user!.id);
      setSpeakerData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Books</h1>
          <p className="text-muted-foreground mt-1">Books assigned to you for recording</p>
        </div>

        {speakerData && speakerData.assigned_books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakerData.assigned_books.map((book) => (
              <Card key={book.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span className="line-clamp-2">{book.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                        {book.file_type.toUpperCase()}
                      </span>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={() => navigate(`/record/${book.id}`)}
                    >
                      Start Recording
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Books Assigned</h3>
              <p className="text-muted-foreground">
                You don't have any books assigned yet. Contact your administrator.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
