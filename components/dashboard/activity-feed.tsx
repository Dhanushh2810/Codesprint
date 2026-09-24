import { formatDistanceToNow } from "date-fns";
import type { ActivityType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityFeed({
  items,
}: {
  items: { id: string; type: ActivityType | string; message: string; createdAt: string | Date }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!items.length ? (
          <p className="text-sm text-muted-foreground">No activity yet. Start practicing!</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <p>{item.message}</p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
