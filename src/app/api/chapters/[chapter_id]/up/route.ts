import { CfgDefaultValue } from "@/app/api/config";
import {
  CusEntityNotFoundError,
  CusEnvVarsConfigError,
  CusTypeError,
  ErrorCode,
  errorHandler,
} from "@/app/api/errorUtils";
import {
  ChapterMO,
  queryChapterById,
  queryChapterByIds,
  queryChapterSiblingNodes,
} from "@/app/api/model";
import { EnvKey, GetEnv } from "@/app/api/utils";
import { Chapter } from "@/interface/chapter";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { chapter_id: string } },
): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;

  let chapters: Chapter[] = [];

  try {
    const chapterId = params["chapter_id"];
    if (!chapterId || isNaN(Number(chapterId))) {
      throw new CusTypeError(
        ErrorCode.ChapterIDTypeError,
        "chapter_id should be a number",
      );
    }

    const depth = verifyDepth(searchParams.get("depth"));
    let parentDepth = depth - 1;

    const lastChapter = await queryChapterById(Number(chapterId));
    if (depth > lastChapter.path.length) {
      parentDepth = lastChapter.path.length;
    }

    let totalChapter: ChapterMO[] = [];
    if (parentDepth == 0) {
      totalChapter.push(lastChapter);
    } else {
      const parentIds = lastChapter.path.slice(-parentDepth);
      let parentChapters = await queryChapterByIds(parentIds);
      if (parentChapters.length != parentDepth) {
        return errorHandler(
          new CusEntityNotFoundError(
            ErrorCode.ChapterNotExistError,
            `Chapter's parent nodes not found`,
          ),
        );
      }
      parentChapters.push(lastChapter);
      totalChapter.push(...parentChapters);
    }

    chapters = await process(totalChapter);
  } catch (err) {
    return errorHandler(err as Error);
  }

  return NextResponse.json({ chapters: chapters });
}

function verifyDepth(value: string | null): number {
  let depth = value || CfgDefaultValue.ChapterUpDepthMinCount;
  if (isNaN(Number(depth))) {
    throw new CusTypeError(
      ErrorCode.ChapterUpDepthTypeError,
      "depth should be a number",
    );
  }

  const maxDepth =
    GetEnv(EnvKey.ChapterUpWithSelfMaxDepth) ||
    CfgDefaultValue.ChapterUpDepthMaxCount;
  if (isNaN(Number(maxDepth))) {
    throw new CusEnvVarsConfigError(
      ErrorCode.ChapterUpDepthMaxError,
      "max depth should be a number",
    );
  }

  if (Number(depth) > Number(maxDepth)) {
    throw new CusTypeError(
      ErrorCode.ChapterUpDepthRangeError,
      `depth should be less than ${maxDepth}`,
    );
  }

  return Number(depth);
}

async function process(chapters: ChapterMO[]): Promise<Chapter[]> {
  let result: Chapter[] = [];
  for (let i = 0; i < chapters.length; i++) {
    let chapter = chapters[i];
    const sliding = await queryChapterSiblingNodes(
      chapter.story_id,
      chapter.level,
    );
    result.push({
      id: chapter.id,
      story_id: chapter.story_id,
      content: chapter.content,
      parent_id: chapter.parent_id,
      wallet_address: chapter.wallet_address,
      path: chapter.path,
      sibling_count: sliding.length,
    } as Chapter);
  }
  return result;
}