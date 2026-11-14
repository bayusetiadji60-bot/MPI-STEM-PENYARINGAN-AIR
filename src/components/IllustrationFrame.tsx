import React, { useState } from 'react';
import { Droplets } from 'lucide-react';

interface IllustrationFrameProps {
  src: string;
  alt: string;
  caption?: string;
  aspectClass?: string;
  className?: string;
}

export const IllustrationFrame: React.FC<IllustrationFrameProps> = ({
  src,
  alt,
  caption,
  aspectClass = 'aspect-video',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${className}`}>
      {failed ? (
        <div
          className={`flex w-full flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-sky-50 to-slate-100 p-6 text-center ${aspectClass}`}
        >
          <Droplets className="h-9 w-9 text-teal-700" />
          <p className="mt-2 max-w-xs text-xs font-semibold text-slate-700">{alt}</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`block w-full object-cover ${aspectClass}`}
        />
      )}
      {caption && (
        <figcaption className="border-t border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
