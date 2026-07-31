import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import InstagramCard from './InstagramCard';
import { InstagramService } from '../services/instagramService';
import { InstagramPost } from '../data/instagramPosts';
import { useLanguage } from '../i18n/LanguageContext';

interface InstagramSectionProps {
  onSelectCarForInquiry?: (carName: string) => void;
}

export default function InstagramSection({ onSelectCarForInquiry }: InstagramSectionProps) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  useEffect(() => {
    InstagramService.getLatestPosts().then((data) => {
      setPosts(data.slice(0, 6));
    });
  }, []);

  return (
    <section className="py-section-gap bg-surface-container-lowest/50 relative border-t border-surface-variant/20 overflow-hidden" id="instagram-feed">
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center space-x-3 justify-center mb-3">
            <div className="w-8 h-px bg-secondary/50" />
            <span className="font-label-caps text-xs text-secondary tracking-widest uppercase">
              @studiosenhorele
            </span>
            <div className="w-8 h-px bg-secondary/50" />
          </div>

          <h2 className="font-headline-lg text-3xl md:text-4xl text-parchment font-serif mb-4">
            Feed do Instagram
          </h2>

          <p className="font-body-md text-sm md:text-base text-on-surface-variant max-w-xl mx-auto">
            Destaques de curadoria, momentos de restauração e os clássicos mais recentes diretamente de nossas redes sociais.
          </p>
        </motion.div>

        {/* 2x3 Grid of 6 Instagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <InstagramCard
              key={post.id}
              post={post}
              index={index}
              onSelectForInquiry={onSelectCarForInquiry}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
