// import { NextRequest, NextResponse } from "next/server";

// const getAllowedOrigins = () => {
//   const origins = ["http://localhost:3000", "http://127.0.0.1:3000"];

//   if (process.env.NEXT_PUBLIC_SITE_URL)
//     origins.push(process.env.NEXT_PUBLIC_SITE_URL);

//   return origins;
// };

// export async function corsWrapper(
//   req: NextRequest,
//   handler: (req: NextRequest) => Promise<NextResponse>
// ): Promise<NextResponse> {
//   // Get origin from request
//   const origin = req.headers.get("origin") || "";
//   const allowedOrigins = getAllowedOrigins();

//   //Create headers with appropriate CORS settings
//   const headers = new Headers();

//   // Check if origin is allowed
//   if (allowedOrigins.includes(origin)) {
//     headers.set("Access-Control-Allow-Origin", origin);
//   } else {
//     // In development, you might want to allow any origin
//     // In production, you'd want to be strict
//     if (process.env.NODE_ENV === "development") {
//       headers.set("Access-Control-Allow-Origin", "*");
//     }
//   }

//   headers.set(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS"
//   );
//   headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   headers.set("Access-Control-Max-Age", "86400");

//   // Handle OPTIONS request (preflight)
//   if (req.method === "OPTIONS") {
//     return new NextResponse(null, { status: 204, headers });
//   }

//   // Call the actual handler
//   const response = await handler(req);

//   // Apply CORS headers to the response
//   Object.entries(headers).forEach(([key, value]) => {
//     response.headers.set(key, value);
//   });

//   return response;
// }
