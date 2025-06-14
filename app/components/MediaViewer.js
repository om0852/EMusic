"use client";

import React from "react";

export default function MediaViewer({ file, type }) {
  if (!file) return null;

  const baseProps = {
    className: "max-h-full max-w-full mx-auto",
    onContextMenu: (e) => e.preventDefault(),
  };

  switch (type) {
    case "image":
      return <img src={file} alt="note" {...baseProps} />;
    case "video":
      return (
        <video
          src={file}
          controls
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          {...baseProps}
          style={{ maxHeight: "100%", maxWidth: "100%" }}
        />
      );
    case "audio":
      return (
        <audio
          src={file}
          controls
          controlsList="nodownload noremoteplayback"
          disableRemotePlayback
          {...baseProps}
        />
      );
    default:
      return null;
  }
}
