import { auth } from "@/auth";

export default async function Dashboard() {
    // セッションを取得
    const session = await auth();
    console.log(session);

    return (
    <div className="max-w-screen-xl mx-auto py-6 px-4">
      <h1 className="text-2xl">Dashboard</h1>
      <h2 className="text-xl">
        Welcome Back:{" "}
        <span className="font-bold">
          {session?.user?.name || "Guest"} {/* 名前がない場合は"Guest"を表示 */}
        </span>
      </h2>
      <p>{JSON.stringify(session)}</p>
    </div>
    );
  }
  
  