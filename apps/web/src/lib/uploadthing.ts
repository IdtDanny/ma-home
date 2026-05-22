// import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";

// const f = createUploadthing();

// // Simple auth check – replace with your actual auth
// const auth = (req: Request) => ({ id: "user" }); // we'll use session in the real check

// export const ourFileRouter = {
//   avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
//     .middleware(async ({ req }) => {
//       // You can get session here – for simplicity, return a dummy user
//       return { userId: "dummy" }; // we'll replace this with real session in the API
//     })
//     .onUploadComplete(async ({ metadata, file }) => {
//       // This runs on the server after upload – we'll handle DB update separately
//       console.log("Upload complete", file.url);
//       return { uploadedBy: metadata.userId };
//     }),
// } satisfies FileRouter;

// export type OurFileRouter = typeof ourFileRouter;

import { createUploadthing } from "uploadthing/next";
import type { FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // Real auth check can be added later
      return { userId: "authenticated" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;