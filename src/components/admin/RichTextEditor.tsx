"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, List, ListOrdered, Image as ImageIcon } from "lucide-react";
import { useCallback } from "react";

export default function RichTextEditor({ content, onChange }: { content: string, onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          uploadImage(file, view, event);
          return true;
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith("image/")) {
            uploadImage(file, view, event);
            return true;
          }
        }
        return false;
      }
    },
  });

  const uploadImage = async (file: File, view: any, event: Event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        const { schema } = view.state;
        const coordinates = view.posAtCoords({ left: (event as MouseEvent).clientX, top: (event as MouseEvent).clientY });
        const node = schema.nodes.image.create({ src: data.url });
        const tr = view.state.tr.insert(coordinates?.pos || view.state.selection.to, node);
        view.dispatch(tr);
      } else {
        alert("Upload gagal: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengunggah gambar.");
    }
  };

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/admin/upload-image", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.status === "success") {
            editor?.chain().focus().setImage({ src: data.url }).run();
          } else {
            alert("Upload gagal: " + data.message);
          }
        } catch (err) {
          console.error(err);
          alert("Gagal mengunggah gambar.");
        }
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col bg-white">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1 items-center flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'bg-gray-200 text-primary' : 'text-gray-600'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'bg-gray-200 text-primary' : 'text-gray-600'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 text-primary' : 'text-gray-600'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-200 text-primary' : 'text-gray-600'}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 flex items-center gap-1 text-sm"
          title="Add Image"
        >
          <ImageIcon size={16} />
          <span>Insert Image</span>
        </button>
      </div>
      <EditorContent editor={editor} className="flex-1 cursor-text" />
    </div>
  );
}
