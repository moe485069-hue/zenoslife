import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, LayoutGrid } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useSectionsStore from '../../store/sectionsStore';
import WidgetCard from './WidgetCard';
import AddWidgetModal from './AddWidgetModal';

/**
 * SectionWidgets — renders the "My Widgets" panel at the bottom of any section page.
 * Usage: <SectionWidgets sectionId="mindfulness" />
 */
const SectionWidgets = ({ sectionId }) => {
  const language = useAppStore(s => s.language);
  const isRtl = language === 'fa';
  const { widgets, loadWidgets } = useSectionsStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadWidgets(sectionId);
  }, [sectionId]);

  const sectionWidgets = widgets.filter(w => w.sectionId === sectionId);

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid size={16} className="text-[var(--accent)]" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {isRtl ? 'ویجت‌های من' : 'My Widgets'}
          </h3>
          {sectionWidgets.length > 0 && (
            <span className="chip chip-accent">{sectionWidgets.length}</span>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-light)] px-3 py-1.5 rounded-xl transition-colors"
        >
          <Plus size={14} />
          {isRtl ? 'افزودن' : 'Add'}
        </button>
      </div>

      {/* Widget grid */}
      {sectionWidgets.length === 0 ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowModal(true)}
          className="w-full border-2 border-dashed border-[var(--border)] rounded-2xl p-6 flex flex-col items-center gap-2 text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={20} className="text-[var(--accent)]" />
          </div>
          <p className="text-sm font-medium">
            {isRtl ? 'ویجت اول خود را بسازید' : 'Create your first widget'}
          </p>
          <p className="text-xs opacity-60">
            {isRtl
              ? 'یادداشت، لینک، شمارنده، چک‌لیست و بیشتر'
              : 'Note, link, counter, checklist and more'}
          </p>
        </motion.button>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 gap-3"
        >
          <AnimatePresence>
            {sectionWidgets.map((w, i) => (
              <WidgetCard key={w.id} widget={w} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add Widget Modal */}
      <AnimatePresence>
        {showModal && (
          <AddWidgetModal
            sectionId={sectionId}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SectionWidgets;
