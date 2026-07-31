import React from 'react';
import { motion } from 'motion/react';
import { InstagramPost } from '../data/instagramPosts';
import { InstagramService } from '../services/instagramService';
import { useLanguage } from '../i18n/LanguageContext';
import { playMechanicalClick } from '../utils/audio';
import { use3DTilt } from '../hooks/use3DTilt';

interface InstagramCardProps {
  key?: React.Key;
  post: InstagramPost;
  index: number;
  onSelectForInquiry?: (title: string) => void;
}

export default function InstagramCard({ post, index }: InstagramCardProps) {
  const { t } = useLanguage();
  const whatsappUrl = InstagramService.generateWhatsAppLink(post);
  const { ref: tiltRef, tiltProps, glareProps } = use3DTilt(8);

  return (
    <div ref={tiltRef} {...tiltProps} className="relative rounded-2xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: 'easeOut' }}
        className="bg-surface-container-low/90 backdrop-blur-sm border border-surface-variant/40 rounded-2xl overflow-hidden hover:border-secondary/60 transition-colors duration-300 group flex flex-col justify-between shadow-lg hover:shadow-2xl relative"
      >
        {/* Amber Glare Overlay */}
        <div className="absolute inset-0 z-30 rounded-2xl pointer-events-none" {...glareProps} />
      <div>
        {/* Instagram Header with Profile Handle */}
        <div className="p-3 bg-surface-container-high/60 border-b border-surface-variant/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0">
              <img
                src="/assets/images/logo-senhorele-192.jpg"
                alt="Studio Senhorele Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-xs font-bold text-parchment leading-tight">
                studiosenhorele
              </span>
              <span className="text-[10px] text-secondary font-mono">
                #{post.shareId}
              </span>
            </div>
          </div>

          <span className="bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-label-caps px-2 py-0.5 rounded-full flex items-center space-x-1">
            <span className="material-symbols-outlined text-[12px]">photo_camera</span>
            <span>Instagram</span>
          </span>
        </div>

        {/* Post Image */}
        <div className="relative aspect-square overflow-hidden bg-surface-container">
          <img
            src={post.mediaUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />

          {/* Likes Badge if available */}
          {post.likeCount && (
            <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md border border-white/20 text-parchment font-label-caps text-[11px] px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
              <span className="material-symbols-outlined text-[13px] text-rose-500 fill-current">favorite</span>
              <span>{post.likeCount}</span>
            </div>
          )}
        </div>

        {/* Post Caption Preview */}
        <div className="p-4 space-y-2">
          <h4 className="font-headline-md text-sm text-parchment font-bold line-clamp-1">
            {post.title}
          </h4>
          <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {post.caption}
          </p>
        </div>
      </div>

      {/* Action Area - Focused Exclusively on WhatsApp Conversion */}
      <div className="p-4 pt-2 border-t border-surface-variant/30 mt-auto">
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playMechanicalClick('click')}
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-label-caps text-xs py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 font-bold shadow-md hover:shadow-lg"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          <span>{t.instagramCard.inquirePost}</span>
        </motion.a>
      </div>
    </motion.div>
    </div>
  );
}
