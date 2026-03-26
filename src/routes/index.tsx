import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { getAPI } from "./api.$";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: response } = useQuery({
    queryKey: ["get"],
    queryFn: () => getAPI().get(),
  });

  if (response?.data) console.log(response?.data);

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <a href="/api">/api</a>
    </div>
  );
}
