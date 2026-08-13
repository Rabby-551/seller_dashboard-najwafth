"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Plus, Pencil, Trash2, Upload, X, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal, ModalHeader, PageFrame } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBook, deleteBook, getCategories, getProfile, getSellerBooks, publishBooks, updateBook } from "@/lib/api";
import { cn, formatCurrency, getAssetUrl } from "@/lib/utils";

type Category = { _id: string; name: string };
type Book = {
  _id: string;
  title?: string;
  author?: string;
  price?: number;
  rating?: number;
  stock?: number | boolean;
  inStock?: boolean;
  description?: string;
  coverImage?: string;
  image?: { url?: string };
  category?: { _id?: string; name?: string };
  is18Plus?: boolean;
};
type BooksResp = { books?: Book[]; meta?: { totalPage?: number } };
type Profile = { _id?: string };
type BulkBookRow = typeof empty & {
  rowNumber: number;
};

const empty = {
  title: "",
  author: "",
  category: "",
  price: "",
  description: "",
  stock: "1",
  is18Plus: false,
};

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value.trim());
      if (row.some(Boolean)) {
        rows.push(row);
      }
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value.trim());
  if (row.some(Boolean)) {
    rows.push(row);
  }

  return rows;
}

function resolveCategoryId(value: string, categories: Category[]) {
  const normalized = value.trim().toLowerCase();
  const match = categories.find(
    (category) => category._id === value.trim() || category.name.toLowerCase() === normalized,
  );
  return match?._id || "";
}

function parseOptionalBoolean(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (["true", "1", "yes", "oui"].includes(normalized)) return true;
  if (["false", "0", "no", "non"].includes(normalized)) return false;
  return undefined;
}

function parseBulkBooksCsv(text: string, categories: Category[]) {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { books: [] as BulkBookRow[], errors: ["CSV must include a header row and at least one book row."] };
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const indexOf = (name: string) => headers.indexOf(name);
  const requiredHeaders = ["title", "author", "category", "price"];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  const quantityIndex = indexOf("quantity") >= 0 ? indexOf("quantity") : indexOf("stock");

  if (missingHeaders.length > 0 || quantityIndex < 0) {
    const missing = [...missingHeaders];
    if (quantityIndex < 0) {
      missing.push("quantity");
    }
    return {
      books: [] as BulkBookRow[],
      errors: [`Missing required columns: ${missing.join(", ")}.`],
    };
  }

  const books: BulkBookRow[] = [];
  const errors: string[] = [];

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const title = row[indexOf("title")] || "";
    const author = row[indexOf("author")] || "";
    const categoryValue = row[indexOf("category")] || "";
    const price = row[indexOf("price")] || "";
    const stock = row[quantityIndex] || "";
    const descriptionIndex = indexOf("description");
    const is18PlusIndex = indexOf("is18plus");
    const category = resolveCategoryId(categoryValue, categories);
    const numericPrice = Number(price);
    const stockQuantity = Number(stock);
    const is18Plus = parseOptionalBoolean(is18PlusIndex >= 0 ? row[is18PlusIndex] || "" : "");

    if (!title || !author || !categoryValue || !price || !stock) {
      errors.push(`Row ${rowNumber}: title, author, category, price, and quantity are required.`);
      return;
    }

    if (!category) {
      errors.push(`Row ${rowNumber}: category must match an existing category name or ID.`);
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      errors.push(`Row ${rowNumber}: price must be a valid non-negative number.`);
      return;
    }

    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      errors.push(`Row ${rowNumber}: quantity must be a non-negative whole number.`);
      return;
    }

    if (is18Plus === undefined) {
      errors.push(`Row ${rowNumber}: is18Plus must be true or false.`);
      return;
    }

    books.push({
      rowNumber,
      title,
      author,
      category,
      price,
      stock,
      description: descriptionIndex >= 0 ? row[descriptionIndex] || "" : "",
      is18Plus,
    });
  });

  return { books, errors };
}

function BookForm({
  initial,
  onCancel,
  onSubmit,
  isPending,
  title,
  subtitle,
  categories,
}: {
  initial: typeof empty & { coverImage?: string };
  onCancel: () => void;
  onSubmit: (form: typeof empty, file: File | null) => void;
  isPending: boolean;
  title: string;
  subtitle: string;
  categories: Category[];
}) {
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const preview = file ? URL.createObjectURL(file) : initial.coverImage;

  return (
    <>
      <ModalHeader title={title} subtitle={subtitle} onClose={onCancel} />
      <div className="grid gap-5 md:grid-cols-[260px_1fr]">
        <div>
          <p className="mb-2 text-[14px] font-medium text-[#202124]">Cover Image</p>
          <label className="relative flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border border-dashed border-[#3d8ef5]/40 bg-white">
            {preview ? <Image src={preview} alt="cover" fill className="object-cover" sizes="260px" /> : null}
            <div className="relative z-10 flex flex-col items-center text-center text-[#3d8ef5]">
              <Upload className="size-7" />
              <p className="mt-2 text-[14px] font-medium">Upload Picture</p>
              <p className="text-[11px] text-[#5b6371]">Recommended size: 800x1200px</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Book Title *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Thinking, Fast and Slow" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#202124]">Author *</label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Daniel Kahneman" />
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#202124]">Price (€) *</label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="22" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_140px] md:items-end">
            <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Category *</label>
              <select
                className="h-12 w-full rounded-[10px] border border-[#cfd4dc] bg-white px-4 text-[14px] text-[#202124]"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#202124]">Quantity *</label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Description</label>
            <textarea
              className="min-h-[120px] w-full rounded-[10px] border border-[#cfd4dc] bg-white px-4 py-3 text-[14px] text-[#202124]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A book on behavioral psychology and decision-making."
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-[#cfd4dc] bg-[#f8fbff] px-4 py-3 text-[14px] font-medium text-[#202124]">
            <input
              type="checkbox"
              checked={form.is18Plus}
              onChange={(event) => setForm({ ...form, is18Plus: event.target.checked })}
              className="size-4 accent-[#6d98c0]"
            />
            Book restricted to ages 18+
          </label>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button className="bg-[#6d98c0] hover:bg-[#5f88ae]" disabled={isPending} onClick={() => onSubmit(form, file)} type="button">
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </>
  );
}

function BulkBookUpload({
  categories,
  isPending,
  onCancel,
  onSubmit,
}: {
  categories: Category[];
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (books: BulkBookRow[]) => void;
}) {
  const [fileName, setFileName] = useState("");
  const [books, setBooks] = useState<BulkBookRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const categoryExample = categories[0]?.name || "Fiction";
  const sampleCsv = [
    "title,author,category,price,quantity,description,is18Plus",
    `"Atomic Habits","James Clear","${categoryExample}",18.99,20,"Build better habits",false`,
    `"Deep Work","Cal Newport","${categoryExample}",16.5,15,"Focus without distraction",false`,
    `"The Alchemist","Paulo Coelho","${categoryExample}",12.99,18,"A journey of purpose and dreams",false`,
    `"Ikigai","Hector Garcia","${categoryExample}",14.25,12,"Find meaning in everyday life",false`,
    `"The Psychology of Money","Morgan Housel","${categoryExample}",17.75,10,"Timeless lessons about wealth",true`,
  ].join("\n");
  const csvColumns = [
    { name: "title", required: true, example: "Atomic Habits" },
    { name: "author", required: true, example: "James Clear" },
    { name: "category", required: true, example: categoryExample },
    { name: "price", required: true, example: "18.99" },
    { name: "quantity", required: true, example: "20" },
    { name: "description", required: false, example: "Build better habits" },
    { name: "is18Plus", required: false, example: "false" },
  ];

  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "books-bulk-upload-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const onPickFile = async (file?: File) => {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileName(file.name);
      setBooks([]);
      setErrors(["Please upload a .csv file."]);
      return;
    }

    const text = await file.text();
    const parsed = parseBulkBooksCsv(text, categories);
    setFileName(file.name);
    setBooks(parsed.books);
    setErrors(parsed.errors);
    if (parsed.errors.length > 0) {
      toast.warning(`${parsed.errors.length} row(s) will be skipped. Check the skipped rows list for details.`);
    }
  };

  return (
    <>
      <ModalHeader
        title="Bulk Upload Books"
        subtitle="Upload a CSV file to add multiple books at once"
        onClose={onCancel}
      />
      <div className="space-y-5">
        <div className="rounded-[14px] border border-[#d8dde6] bg-[#f8fbff] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[15px] font-semibold text-[#202124]">CSV format</p>
              <p className="mt-1 text-[13px] text-[#5b6371]">
                Keep the first row exactly as column headers. Required columns are marked with *.
              </p>
            </div>
            <Button variant="outline" className="h-9 shrink-0 px-3 text-[13px]" onClick={downloadSample} type="button">
              Download Sample
            </Button>
          </div>

          <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e3e6ec] bg-white">
            <div className="grid grid-cols-[120px_90px_1fr] bg-[#eef5ff] px-3 py-2 text-[12px] font-semibold text-[#202124]">
              <span>Column</span>
              <span>Required</span>
              <span>Example</span>
            </div>
            {csvColumns.map((column) => (
              <div
                key={column.name}
                className="grid grid-cols-[120px_90px_1fr] border-t border-[#edf0f4] px-3 py-2 text-[12px] text-[#5b6371]"
              >
                <span className="font-mono font-semibold text-[#202124]">
                  {column.name}
                  {column.required ? " *" : ""}
                </span>
                <span>{column.required ? "Yes" : "No"}</span>
                <span className="truncate">{column.example}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[13px] text-[#5b6371]">
            Category must match an existing backend category name or category ID. Matching categories are saved with their category ID.
            Rows with unmatched categories are skipped. Cover image is not uploaded by CSV; add images later from Edit Book.
          </p>
        </div>

        <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed border-[#6d98c0] bg-white px-5 py-8 text-center text-[#3d8ef5]">
          <Upload className="size-8" />
          <p className="mt-3 text-[16px] font-semibold">{fileName || "Choose CSV file"}</p>
          <p className="mt-1 text-[13px] text-[#5b6371]">Only .csv files are supported</p>
          <input className="hidden" type="file" accept=".csv,text/csv" onChange={(event) => onPickFile(event.target.files?.[0])} />
        </label>

        {errors.length > 0 ? (
          <div className="max-h-[160px] overflow-auto rounded-[12px] border border-[#f3b4b4] bg-[#fff5f5] p-4 text-[13px] text-[#b42318]">
            <p className="mb-2 font-semibold">{errors.length} skipped row(s)</p>
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        {books.length > 0 ? (
          <div className="overflow-hidden rounded-[12px] border border-[#e3e6ec]">
            <div className="border-b border-[#e3e6ec] bg-[#f8fbff] px-4 py-3 text-[14px] font-medium text-[#202124]">
              Preview: {books.length} valid {books.length === 1 ? "book" : "books"}
            </div>
            <div className="max-h-[260px] overflow-auto">
              <table className="w-full min-w-[1040px] text-left text-[13px]">
                <thead className="bg-white text-[#5b6371]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Row</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">18+</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={`${book.rowNumber}-${book.title}`} className="border-t border-[#edf0f4]">
                      <td className="px-4 py-3 text-[#5b6371]">{book.rowNumber}</td>
                      <td className="px-4 py-3 font-medium text-[#202124]">{book.title}</td>
                      <td className="px-4 py-3 text-[#5b6371]">{book.author}</td>
                      <td className="px-4 py-3 text-[#5b6371]">{book.category}</td>
                      <td className="px-4 py-3 text-[#5b6371]">{book.price}</td>
                      <td className="px-4 py-3 text-[#5b6371]">{book.stock}</td>
                      <td className="max-w-[260px] truncate px-4 py-3 text-[#5b6371]">{book.description || "N/A"}</td>
                      <td className="px-4 py-3 text-[#5b6371]">{book.is18Plus ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button
          className="bg-[#6d98c0] hover:bg-[#5f88ae]"
          disabled={isPending || books.length === 0}
          onClick={() => {
            if (errors.length > 0) {
              toast.warning(`${books.length} valid row(s) will upload. ${errors.length} row(s) will not upload.`);
            }
            onSubmit(books);
          }}
          type="button"
        >
          {isPending ? "Uploading..." : "Upload Books"}
        </Button>
      </div>
    </>
  );
}

function BooksGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="h-[380px] rounded-[14px] border-[#e3e6ec] bg-white p-3 shadow-none" />
      ))}
    </div>
  );
}

export default function BooksPage() {
  const queryClient = useQueryClient();
  const [openAdd, setOpenAdd] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [openPublish, setOpenPublish] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const profileQuery = useQuery<Profile>({
    queryKey: ["seller-profile"],
    queryFn: getProfile,
  });
  const sellerId = profileQuery.data?._id;

  const booksQuery = useQuery<BooksResp>({
    queryKey: ["seller-books", sellerId],
    queryFn: () => getSellerBooks({ page: 1, limit: 24, shopId: sellerId }),
    enabled: !!sellerId,
  });
  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["seller-categories"],
    queryFn: getCategories,
  });

  const books = booksQuery.data?.books || [];
  const categories = categoriesQuery.data || [];
  const isBooksLoading = profileQuery.isLoading || booksQuery.isLoading;

  const createMutation = useMutation({
    mutationFn: createBook,
    onSuccess: () => {
      toast.success("Book created.");
      queryClient.invalidateQueries({ queryKey: ["seller-books"] });
      setOpenAdd(false);
    },
  });
  const bulkCreateMutation = useMutation({
    mutationFn: async (rows: BulkBookRow[]) => {
      const failures: string[] = [];

      for (const row of rows) {
        const fd = new FormData();
        fd.set("title", row.title);
        fd.set("author", row.author);
        fd.set("price", row.price);
        fd.set("description", row.description);
        fd.set("category", row.category);
        fd.set("stock", row.stock);
        fd.set("is18Plus", String(row.is18Plus));

        try {
          await createBook(fd);
        } catch {
          failures.push(`Row ${row.rowNumber}: ${row.title}`);
        }
      }

      return {
        uploaded: rows.length - failures.length,
        failed: failures,
      };
    },
    onSuccess: ({ uploaded, failed }) => {
      if (failed.length > 0) {
        toast.warning(`${uploaded} uploaded, ${failed.length} not uploaded. ${failed.join(", ")}`);
      } else {
        toast.success(`${uploaded} ${uploaded === 1 ? "book" : "books"} uploaded.`);
      }
      queryClient.invalidateQueries({ queryKey: ["seller-books"] });
      if (uploaded > 0) {
        setOpenBulk(false);
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Bulk upload failed.");
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> | FormData }) => updateBook(id, payload),
    onSuccess: () => {
      toast.success("Book updated.");
      queryClient.invalidateQueries({ queryKey: ["seller-books"] });
      setEditing(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      toast.success("Book deleted.");
      queryClient.invalidateQueries({ queryKey: ["seller-books"] });
    },
  });
  const publishMutation = useMutation({
    mutationFn: publishBooks,
    onSuccess: () => {
      toast.success("Books published.");
      queryClient.invalidateQueries({ queryKey: ["seller-books"] });
      setOpenPublish(false);
      setSelected(new Set());
    },
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitForm = (form: typeof empty, file: File | null, id?: string) => {
    if (!form.title.trim() || !form.author.trim() || !form.price || !form.category) {
      toast.error("Title, author, category, and price are required.");
      return;
    }

    const stockQuantity = Number(form.stock);
    if (!form.stock || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
      toast.error("Stock quantity must be a whole number.");
      return;
    }

    const fd = new FormData();
    fd.set("title", form.title);
    fd.set("author", form.author);
    fd.set("price", form.price);
    fd.set("description", form.description);
    if (form.category) fd.set("category", form.category);
    fd.set("stock", String(stockQuantity));
    fd.set("is18Plus", String(form.is18Plus));
    if (file) fd.set("coverImage", file);

    if (id) {
      updateMutation.mutate({ id, payload: fd });
      return;
    }

    createMutation.mutate(fd);
  };

  return (
    <PageFrame
      title="Books Management"
      subtitle="Add, edit, and organize your book collection"
      action={
        <div className="flex gap-3">
          <Button className="bg-[#6d98c0] hover:bg-[#5f88ae]" onClick={() => setOpenAdd(true)}>
            <Plus className="size-4" /> Add Single Book
          </Button>
          <Button variant="outline" onClick={() => setOpenBulk(true)}>
            <Upload className="size-4" /> Bulk Upload CSV
          </Button>
          <Button variant="outline" onClick={() => setOpenPublish(true)} disabled={books.length === 0}>
            <Upload className="size-4" /> Published
          </Button>
        </div>
      }
    >
      {isBooksLoading ? <BooksGridSkeleton /> : null}

      {!isBooksLoading && books.length === 0 ? (
        <Card className="rounded-[18px] border-dashed border-[#cfd4dc] bg-white p-10 text-center shadow-none">
          <h2 className="text-[20px] font-semibold text-[#202124]">No books yet</h2>
          <p className="mt-2 text-[15px] text-[#5b6371]">Create books from seller dashboard and they will show here.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button className="bg-[#6d98c0] hover:bg-[#5f88ae]" onClick={() => setOpenAdd(true)}>
              <Plus className="size-4" /> Add Single Book
            </Button>
            <Button variant="outline" onClick={() => setOpenBulk(true)}>
              <Upload className="size-4" /> Bulk Upload CSV
            </Button>
          </div>
        </Card>
      ) : null}

      {!booksQuery.isLoading && books.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => {
            const cover = getAssetUrl(book.image || book.coverImage);
            const stockQuantity = typeof book.stock === "boolean" ? (book.stock ? 1 : 0) : Number(book.stock ?? (book.inStock ? 1 : 0));
            const inStock = stockQuantity > 0;

            return (
              <Card key={book._id} className="overflow-hidden rounded-[14px] border-[#e3e6ec] bg-white p-3 shadow-none">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#e3e6ec]">
                  {cover ? <Image src={cover} alt={book.title || "Book"} fill className="object-cover" sizes="320px" /> : null}
                  <span className="absolute right-2 top-2 rounded-md bg-[#103670] px-2 py-1 text-[11px] font-semibold text-white">
                    {inStock ? `${stockQuantity} in stock` : "Stock out"}
                  </span>
                  {book.is18Plus ? (
                    <span className="absolute left-2 top-2 rounded-md bg-[#b42318] px-2 py-1 text-[11px] font-semibold text-white">
                      18+
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[16px] font-semibold text-[#202124]">{book.title || "Untitled book"}</h3>
                    <span className="inline-flex items-center gap-0.5 text-[12px] text-[#f59e0b]">
                      <Star className="size-3.5 fill-current" /> {book.rating ?? 0}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#5b6371]">{book.author || "Unknown author"}</p>
                  <p className="flex items-center gap-1 text-[12px] text-[#5b6371]">
                    <MapPin className="size-3.5 text-[#3d8ef5]" /> {book.category?.name || "Uncategorized"}
                  </p>
                  <p className="text-[14px] font-semibold text-[#3d8ef5]">{formatCurrency(book.price ?? 0)}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="outline" className="border-[#3d8ef5] text-[#3d8ef5]" onClick={() => setEditing(book)}>
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <Button className="bg-[#fde7e7] text-[#d92d20] hover:bg-[#fbd1d1]" onClick={() => deleteMutation.mutate(book._id)}>
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} className="max-w-[820px]">
        <BookForm
          initial={{ ...empty }}
          onCancel={() => setOpenAdd(false)}
          onSubmit={(form, file) => submitForm(form, file)}
          isPending={createMutation.isPending}
          title="Add New Book"
          subtitle="Add a new book by filling in the required information"
          categories={categories}
        />
      </Modal>

      <Modal open={openBulk} onClose={() => setOpenBulk(false)} className="max-w-[880px]">
        <BulkBookUpload
          categories={categories}
          isPending={bulkCreateMutation.isPending}
          onCancel={() => setOpenBulk(false)}
          onSubmit={(rows) => bulkCreateMutation.mutate(rows)}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} className="max-w-[820px]">
        {editing ? (
          <BookForm
            initial={{
              title: editing.title || "",
              author: editing.author || "",
              category: editing.category?._id || "",
              price: String(editing.price ?? ""),
              description: editing.description || "",
              stock:
                typeof editing.stock === "boolean"
                  ? editing.stock
                    ? "1"
                    : "0"
                  : String(editing.stock ?? (editing.inStock ? 1 : 0)),
              coverImage: getAssetUrl(editing.image || editing.coverImage) || undefined,
              is18Plus: Boolean(editing.is18Plus),
            }}
            onCancel={() => setEditing(null)}
            onSubmit={(form, file) => submitForm(form, file, editing._id)}
            isPending={updateMutation.isPending}
            title="Edit Book"
            subtitle="Edit Book Information"
            categories={categories}
          />
        ) : null}
      </Modal>

      <Modal open={openPublish} onClose={() => setOpenPublish(false)} className="max-w-[1100px]">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-[22px] font-semibold text-[#202124]">Select books to publish</h2>
          <button onClick={() => setOpenPublish(false)} type="button" className="text-[#5b6371]">
            <X className="size-5" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => {
            const cover = getAssetUrl(book.image || book.coverImage);
            const isSelected = selected.has(book._id);

            return (
              <button
                key={book._id}
                onClick={() => toggleSelect(book._id)}
                className={cn(
                  "relative overflow-hidden rounded-[14px] border bg-white p-3 text-left transition",
                  isSelected ? "border-[#3d8ef5] ring-2 ring-[#3d8ef5]/30" : "border-[#e3e6ec]",
                )}
                type="button"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#e3e6ec]">
                  {cover ? <Image src={cover} alt={book.title || ""} fill className="object-cover" sizes="240px" /> : null}
                  {book.is18Plus ? (
                    <span className="absolute left-2 top-2 rounded-md bg-[#b42318] px-2 py-1 text-[11px] font-semibold text-white">18+</span>
                  ) : null}
                </div>
                <h3 className="mt-2 text-[14px] font-semibold text-[#202124]">{book.title || "Untitled book"}</h3>
                <p className="text-[12px] text-[#5b6371]">{book.author || "Unknown author"}</p>
                <p className="mt-1 text-[14px] font-semibold text-[#3d8ef5]">{formatCurrency(book.price || 0)}</p>
                {isSelected ? (
                  <span className="absolute right-3 top-3 inline-flex size-6 items-center justify-center rounded-full bg-[#3d8ef5] text-white">+</span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpenPublish(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#6d98c0] hover:bg-[#5f88ae]"
            disabled={publishMutation.isPending || selected.size === 0}
            onClick={() => publishMutation.mutate(Array.from(selected))}
          >
            <Upload className="size-4" /> {publishMutation.isPending ? "Publishing..." : "Published"}
          </Button>
        </div>
      </Modal>
    </PageFrame>
  );
}
