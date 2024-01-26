// import { NextResponse } from "next/server";
// import { bot } from "../bot";

// export async function GET(request) {
//     return NextResponse.json({ message: "Hello World" }, { status: 200 });
// }

// export async function POST(request) {
//     try {
//         bot.processUpdate(await request.json());
//         return new Response("", { status: 200 });
//     } catch (e) {
//         console.error(e);
//         return new Response("", { status: 500 });
//     }
// }