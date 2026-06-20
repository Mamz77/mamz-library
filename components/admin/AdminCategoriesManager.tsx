"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, FolderOpen } from "lucide-react";
import { createCategory, deleteCategory, createTag, deleteTag } from "@/lib/admin/categoryActions";
import toast from "react-hot-toast";
import type { Category, Tag as TagType } from "@/types";

interface AdminCategoriesManagerProps {
  categories: Category[];
  tags: TagType[];
}

export function AdminCategoriesManager({ categories: initCats, tags: initTags }: AdminCategoriesManagerProps) {
  const [categories, setCategories] = useState(initCats);
  const [tags, setTags] = useState(initTags);
  const [catName, setCatName] = useState("");
  const [tagName, setTagName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddCat(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("name", catName.trim());
    const res = await createCategory(fd);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "");
      setCatName("");
      window.location.reload();
    }
    setLoading(false);
  }

  async function handleDeleteCat(id: string) {
    if (!confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟")) return;
    const res = await deleteCategory(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (!tagName.trim()) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("name", tagName.trim());
    const res = await createTag(fd);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "");
      setTagName("");
      window.location.reload();
    }
    setLoading(false);
  }

  async function handleDeleteTag(id: string) {
    const res = await deleteTag(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success(res.success || "");
      setTags((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Categories */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">دسته‌بندی‌ها</h3>
          <span className="text-xs text-muted-foreground mr-auto">
            {categories.length} مورد
          </span>
        </div>

        <form onSubmit={handleAddCat} className="flex gap-2 mb-4">
          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="نام دسته‌بندی جدید"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading || !catName.trim()}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            افزودن
          </button>
        </form>

        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 group transition-colors">
              <span className="text-sm text-foreground">{cat.name}</span>
              <button
                onClick={() => handleDeleteCat(cat.id)}
                className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">برچسب‌ها</h3>
          <span className="text-xs text-muted-foreground mr-auto">
            {tags.length} مورد
          </span>
        </div>

        <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="نام برچسب جدید"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading || !tagName.trim()}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            افزودن
          </button>
        </form>

        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-sm text-foreground group"
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
