-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT,
    "materialUrl" TEXT,
    "platform" TEXT NOT NULL,
    "sheet" TEXT NOT NULL,
    "grammarCategory" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "keywords" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
