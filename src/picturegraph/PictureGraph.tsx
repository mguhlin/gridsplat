import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';

import {
  addPicture,
  initialPictureCategories,
  removePicture,
  scaledPictureCount,
  updateCategoryCount,
  type PictureCategory,
} from './model';

function PictureToken() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'picture-token',
  });

  return (
    <button
      ref={setNodeRef}
      className="picture-token"
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
      type="button"
      {...listeners}
      {...attributes}
    >
      Drag one picture
    </button>
  );
}

function PictureColumn({
  category,
  scale,
}: {
  category: PictureCategory;
  scale: number;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: category.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'picture-column over' : 'picture-column'}
      data-testid={`picture-column-${category.id}`}
    >
      <div className="picture-stack" aria-label={`${category.label} pictures`}>
        {Array.from({
          length: scaledPictureCount(category.count, scale),
        }).map((_, index) => (
          <span className="picture-symbol" key={`${category.id}-${index}`}>
            {category.icon}
          </span>
        ))}
      </div>
      <strong>{category.label}</strong>
      <span>{category.count} total</span>
    </div>
  );
}

export function PictureGraph() {
  const graphRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState(initialPictureCategories);
  const [scale, setScale] = useState(1);
  const [message, setMessage] = useState('');

  function handleDragEnd(event: DragEndEvent) {
    const targetId = event.over?.id;

    if (typeof targetId !== 'string') {
      return;
    }

    setCategories((current) => addPicture(current, targetId));
  }

  async function exportPictureGraph() {
    if (!graphRef.current) {
      return;
    }

    const png = await toPng(graphRef.current, {
      pixelRatio: 2,
    });
    const anchor = document.createElement('a');

    anchor.href = png;
    anchor.download = 'easysheet-picture-graph.png';
    anchor.click();
    setMessage('Downloaded a picture graph image.');
  }

  return (
    <section
      className="picture-graph-workspace"
      aria-labelledby="picture-title"
    >
      <header className="module-header">
        <div>
          <p className="eyebrow">Picture Graph</p>
          <h2 id="picture-title">Favorite Fruit Pictograph</h2>
        </div>
        <label className="scale-control">
          Each picture equals
          <input
            min="1"
            type="number"
            value={scale}
            onChange={(event) =>
              setScale(Math.max(1, Number(event.target.value)))
            }
          />
        </label>
        <button
          className="big-action secondary"
          type="button"
          onClick={exportPictureGraph}
        >
          Export Picture PNG
        </button>
      </header>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="picture-tools">
          <PictureToken />
        </div>
        <div
          ref={graphRef}
          className="picture-graph"
          data-testid="picture-graph"
        >
          {categories.map((category) => (
            <PictureColumn
              category={category}
              key={category.id}
              scale={scale}
            />
          ))}
        </div>
      </DndContext>
      <div className="picture-data-table" aria-label="Picture graph data table">
        {categories.map((category) => (
          <div className="picture-data-row" key={category.id}>
            <label>
              {category.label}
              <input
                min="0"
                type="number"
                value={category.count}
                onChange={(event) =>
                  setCategories((current) =>
                    updateCategoryCount(
                      current,
                      category.id,
                      Number(event.target.value),
                    ),
                  )
                }
              />
            </label>
            <button
              aria-label={`Remove one ${category.label}`}
              className="picture-stepper"
              type="button"
              onClick={() =>
                setCategories((current) => removePicture(current, category.id))
              }
            >
              -
            </button>
            <button
              aria-label={`Add one ${category.label}`}
              className="picture-stepper"
              type="button"
              onClick={() =>
                setCategories((current) => addPicture(current, category.id))
              }
            >
              +
            </button>
          </div>
        ))}
      </div>
      <p aria-live="polite" className="file-message">
        {message}
      </p>
    </section>
  );
}
