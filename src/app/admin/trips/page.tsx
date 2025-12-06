import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatToYYYYMMDD } from "@/lib/format-date";
import { honoClient } from "@/lib/hono";

export default async function AdminTripsPage() {
  const res = await honoClient.trip.$get();
  if (!res.ok) {
    throw new Error("旅行の取得に失敗しました");
  }
  const trips = await res.json();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">旅行管理</h1>
        <Button asChild>
          <Link href="/admin/trips/new">
            <Plus className="h-4 w-4" />
            新規作成
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>旅行一覧</CardTitle>
          <CardDescription>登録されている旅行を管理します。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>説明</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    <Link href={`/trip/${trip.id}`}>{trip.title}</Link>
                  </TableCell>
                  <TableCell>{trip.description}</TableCell>
                  <TableCell>
                    {formatToYYYYMMDD(new Date(trip.createdAt))}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/trips/${trip.id}/edit`}>編集</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
