import { FormField } from "@/components/auth/FormField";
import type { Category, Tag, Book } from "@/types";
import { cn } from "@/lib/utils";

interface BookFormFieldsProps {
  categories: Category[];
  tags: Tag[];
  defaultValues?: Partial<Book & { tag_ids: string[] }>;
}

export function BookFormFields({ categories, tags, defaultValues }: BookFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="عنوان کتاب *"
          name="title"
          type="text"
          placeholder="عنوان کتاب"
          required
          defaultValue={defaultValues?.title}
        />
        <FormField
          label="نویسنده *"
          name="author"
          type="text"
          placeholder="نام نویسنده"
          required
          defaultValue={defaultValues?.author}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">توضیحات</label>
        <textarea
          name="description"
          rows={3}
          placeholder="توضیح مختصری درباره کتاب..."
          defaultValue={defaultValues?.description}
          className={cn(
            "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground",
            "placeholder:text-muted-foreground resize-none",
            "focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          )}
        />
      </div>

      <FormField
        label="لینک جلد کتاب (URL)"
        name="cover_url"
        type="url"
        placeholder="https://..."
        dir="ltr"
        defaultValue={defaultValues?.cover_url}
      />

      <FormField
        label="لینک فایل PDF *"
        name="pdf_url"
        type="url"
        placeholder="https://www.gutenberg.org/files/.../..."
        required
        dir="ltr"
        defaultValue={defaultValues?.pdf_url}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="تعداد صفحات"
          name="total_pages"
          type="number"
          placeholder="۲۵۰"
          min="1"
          defaultValue={defaultValues?.total_pages?.toString()}
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">دسته‌بندی</label>
          <select
            name="category_id"
            defaultValue={defaultValues?.category_id || ""}
            className={cn(
              "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            )}
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">برچسب‌ها</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                name="tag_ids"
                value={tag.id}
                defaultChecked={defaultValues?.tag_ids?.includes(tag.id)}
                className="rounded border-border text-primary"
              />
              <span className="text-sm text-foreground">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_published"
            value="true"
            defaultChecked={defaultValues?.is_published}
            className="rounded border-border text-primary w-4 h-4"
          />
          <span className="text-sm font-medium text-foreground">انتشار فوری</span>
        </label>
        <p className="text-xs text-muted-foreground mt-1 mr-6">
          کتاب بلافاصله در سایت نمایش داده می‌شود
        </p>
      </div>
    </div>
  );
}
