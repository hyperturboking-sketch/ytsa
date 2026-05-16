import { spawn } from "child_process";
import express from "express";
const app = express();

app.get("/download", (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).send("Missing video URL");
  }

  const ytdlp = spawn("yt-dlp", [
    "-f", "bestvideo+bestaudio",
    "--merge-output-format", "mp4",
    "-o", "-", // output to stdout
    videoUrl
  ]);

  res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
  res.setHeader("Content-Type", "video/mp4");

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on("data", (data) => {
    console.error(`yt-dlp error: ${data}`);
  });

  ytdlp.on("close", (code) => {
    console.log(`yt-dlp exited with code ${code}`);
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
