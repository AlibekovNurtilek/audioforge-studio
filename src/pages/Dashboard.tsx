import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Mic, FolderOpen } from "lucide-react";
import { usersService } from "@/services/users";
import { booksService } from "@/services/books";
import { categoriesService } from "@/services/categories";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    books: 0,
    categories: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, books, categories] = await Promise.all([
        usersService.getUsers(),
        booksService.getBooks(),
        categoriesService.getCategories(),
      ]);

      setStats({
        users: users.length,
        books: books.length,
        categories: categories.length,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const statCards = [
    { title: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { title: "Total Books", value: stats.books, icon: BookOpen, color: "text-success" },
    { title: "Categories", value: stats.categories, icon: FolderOpen, color: "text-warning" },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your TTS studio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
