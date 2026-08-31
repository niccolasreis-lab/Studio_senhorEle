import React, { ReactNode } from 'react';

type PostMediaOrientation = 'portrait' | 'landscape' | 'square';

interface PostMediaLayoutProps {
  orientation: PostMediaOrientation;
  media: ReactNode;
  portraitDetails: ReactNode;
  landscapeContent: ReactNode;
  landscapeAside: ReactNode;
}

/**
 * Keeps the post internals reusable while allowing portrait and landscape
 * media to use genuinely different editorial compositions.
 */
export default function PostMediaLayout({
  orientation,
  media,
  portraitDetails,
  landscapeContent,
  landscapeAside,
}: PostMediaLayoutProps) {
  if (orientation === 'portrait') {
    return (
      <div
        data-media-layout="portrait"
        className="grid grid-cols-1 items-start gap-7 md:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] md:gap-7 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] lg:gap-10"
      >
        <div className="min-w-0">{media}</div>
        <div className="min-w-0 md:pt-1">{portraitDetails}</div>
      </div>
    );
  }

  return (
    <div data-media-layout={orientation}>
      <div>{media}</div>
      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:gap-10">
        <div className="min-w-0">{landscapeContent}</div>
        <aside className="min-w-0">{landscapeAside}</aside>
      </div>
    </div>
  );
}
