"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  type Category,
  type Characteristics,
  type Product,
  type Tasting,
} from "@/lib/types";
import {
  CHARACTERISTICS_BY_CATEGORY,
  TASTING_TAGS_BY_CATEGORY,
  TASTING_NOTE_SECTION_LABELS,
} from "@/lib/tasting-templates";
import { ProductSearch } from "@/components/product-search";
import { TastingNoteSection } from "@/components/tasting-note-section";
import { CharacteristicSliders } from "@/components/characteristic-sliders";
import { PhotoUploader } from "@/components/photo-uploader";
import { TagInput } from "@/components/tag-input";
import { RatingStars } from "@/components/rating-stars";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TastingFormProps {
  profileId: string;
  mode: "create" | "edit";
  /** Fixed product for edit mode — which product a tasting belongs to can't change after creation. */
  product?: Product;
  initial?: Tasting;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

const CATEGORY_OPTIONS: Category[] = ["wine", "whiskey", "other"];

export function TastingForm({
  profileId,
  mode,
  product,
  initial,
}: TastingFormProps) {
  const router = useRouter();
  const [tastingId] = useState(() => initial?.id ?? crypto.randomUUID());

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    product ?? null,
  );
  const [productNameInput, setProductNameInput] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("wine");
  const [newProducer, setNewProducer] = useState("");
  const [newRegion, setNewRegion] = useState("");

  const effectiveCategory: Category = selectedProduct?.category ?? newCategory;

  const [vintageOrAge, setVintageOrAge] = useState(
    initial?.vintage_or_age ?? "",
  );
  const [abv, setAbv] = useState(
    initial?.abv != null ? String(initial.abv) : "",
  );
  const [rating, setRating] = useState(initial?.rating ?? 3);
  const [tastedOn, setTastedOn] = useState(initial?.tasted_on ?? todayString());
  const [purchasedOn, setPurchasedOn] = useState(initial?.purchased_on ?? "");
  const [purchasePlace, setPurchasePlace] = useState(
    initial?.purchase_place ?? "",
  );
  const [purchasePrice, setPurchasePrice] = useState(
    initial?.purchase_price != null ? String(initial.purchase_price) : "",
  );
  const [noseNote, setNoseNote] = useState(initial?.nose_note ?? "");
  const [palateNote, setPalateNote] = useState(initial?.palate_note ?? "");
  const [finishNote, setFinishNote] = useState(initial?.finish_note ?? "");
  const [overallNote, setOverallNote] = useState(initial?.overall_note ?? "");
  const [characteristics, setCharacteristics] = useState<Characteristics>(
    initial?.characteristics ?? {},
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [photoPaths, setPhotoPaths] = useState<string[]>(
    initial?.photo_paths ?? [],
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagLists = TASTING_TAGS_BY_CATEGORY[effectiveCategory];
  const characteristicDefs = CHARACTERISTICS_BY_CATEGORY[effectiveCategory];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "create" && !selectedProduct && !productNameInput.trim()) {
      setError("술 이름을 입력하거나 기존 제품을 선택해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      let productId = selectedProduct?.id ?? product?.id;

      if (!productId) {
        const { data: createdProduct, error: productError } = await supabase
          .from("products")
          .insert({
            name: productNameInput.trim(),
            category: newCategory,
            producer: newProducer.trim() || null,
            region: newRegion.trim() || null,
            created_by: profileId,
          })
          .select("*")
          .single();
        if (productError) throw productError;
        productId = createdProduct.id;
      }

      const payload = {
        id: tastingId,
        product_id: productId,
        profile_id: profileId,
        vintage_or_age: vintageOrAge.trim() || null,
        abv: abv.trim() ? Number(abv) : null,
        rating,
        tasted_on: tastedOn,
        purchased_on: purchasedOn || null,
        purchase_place: purchasePlace.trim() || null,
        purchase_price: purchasePrice.trim() ? Number(purchasePrice) : null,
        nose_note: noseNote.trim() || null,
        palate_note: palateNote.trim() || null,
        finish_note: finishNote.trim() || null,
        overall_note: overallNote.trim() || null,
        characteristics,
        tags,
        photo_paths: photoPaths,
      };

      if (mode === "create") {
        const { error: insertError } = await supabase
          .from("tastings")
          .insert(payload);
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from("tastings")
          .update(payload)
          .eq("id", tastingId);
        if (updateError) throw updateError;
      }

      router.push(`/drink/${tastingId}`);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "저장하지 못했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-2">
        <Label>사진</Label>
        <PhotoUploader
          profileId={profileId}
          tastingId={tastingId}
          value={photoPaths}
          onChange={setPhotoPaths}
        />
      </section>

      <section className="space-y-3">
        <Label>술 이름 *</Label>
        {mode === "edit" ? (
          <div className="rounded-md border p-3">
            <p className="font-medium">{product?.name}</p>
            <p className="text-xs text-muted-foreground">
              {product ? CATEGORY_LABELS[product.category] : ""}
              {product?.producer ? ` · ${product.producer}` : ""}
            </p>
          </div>
        ) : (
          <ProductSearch
            value={selectedProduct}
            onSelect={setSelectedProduct}
            nameInput={productNameInput}
            onNameInputChange={setProductNameInput}
          />
        )}

        {mode === "create" && !selectedProduct && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>종류 *</Label>
              <div className="flex gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={newCategory === cat ? "default" : "outline"}
                    onClick={() => setNewCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>생산자·증류소</Label>
                <Input
                  value={newProducer}
                  onChange={(event) => setNewProducer(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>지역</Label>
                <Input
                  value={newRegion}
                  onChange={(event) => setNewRegion(event.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>빈티지 / 숙성연수</Label>
          <Input
            value={vintageOrAge}
            onChange={(event) => setVintageOrAge(event.target.value)}
            placeholder="예: 2018, 12년"
          />
        </div>
        <div className="space-y-1">
          <Label>도수 (ABV %)</Label>
          <Input
            type="number"
            step="0.1"
            value={abv}
            onChange={(event) => setAbv(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>시음일</Label>
          <Input
            type="date"
            value={tastedOn}
            onChange={(event) => setTastedOn(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>별점 *</Label>
          <RatingStars value={rating} onChange={setRating} size={24} />
        </div>
      </section>

      <section className="space-y-2 rounded-md border p-4">
        <p className="text-sm font-medium">구입 정보 (선택)</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>구입일</Label>
            <Input
              type="date"
              value={purchasedOn}
              onChange={(event) => setPurchasedOn(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>구입처</Label>
            <Input
              value={purchasePlace}
              onChange={(event) => setPurchasePlace(event.target.value)}
              placeholder="매장/사이트명"
            />
          </div>
          <div className="space-y-1">
            <Label>구입 가격</Label>
            <Input
              type="number"
              value={purchasePrice}
              onChange={(event) => setPurchasePrice(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <TastingNoteSection
          label={TASTING_NOTE_SECTION_LABELS.nose}
          tags={tagLists.nose}
          value={noseNote}
          onChange={setNoseNote}
        />
        <TastingNoteSection
          label={TASTING_NOTE_SECTION_LABELS.palate}
          tags={tagLists.palate}
          value={palateNote}
          onChange={setPalateNote}
        />
        <TastingNoteSection
          label={TASTING_NOTE_SECTION_LABELS.finish}
          tags={tagLists.finish}
          value={finishNote}
          onChange={setFinishNote}
        />
        <div className="space-y-2">
          <Label>총평</Label>
          <Textarea
            value={overallNote}
            onChange={(event) => setOverallNote(event.target.value)}
            rows={4}
            placeholder="자유롭게 총평을 남겨보세요"
          />
        </div>
      </section>

      <section className="space-y-2">
        <Label>특성</Label>
        <CharacteristicSliders
          defs={characteristicDefs}
          value={characteristics}
          onChange={setCharacteristics}
        />
      </section>

      <section className="space-y-2">
        <Label>태그</Label>
        <TagInput value={tags} onChange={setTags} placeholder="품종, 캐스크타입 등" />
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting
          ? "저장 중..."
          : mode === "create"
            ? "기록 저장"
            : "수정 저장"}
      </Button>
    </form>
  );
}
