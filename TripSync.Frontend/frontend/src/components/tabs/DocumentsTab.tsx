import axios from "axios";
import { type FormEvent, useEffect, useState } from "react";
import { documentService } from "../../services/documentService";
import type { CreateTripDocumentRequest, ParticipantDocuments, TripDocument } from "../../types";

interface DocumentsTabProps {
    tripId: string;
    onChanged: () => void;
}

const initialForm: CreateTripDocumentRequest = {
    name: "",
    description: "",
    category: "",
    isRequired: false,
};

export default function DocumentsTab({ tripId, onChanged }: DocumentsTabProps) {
    const [groups, setGroups] = useState<ParticipantDocuments[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<CreateTripDocumentRequest>(initialForm);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDocuments();
    }, [tripId]);

    async function loadDocuments() {
        setLoading(true);

        try {
            const data = await documentService.list(tripId);
            setGroups(data);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggle(documentId: string) {
        try {
            setError(null);
            await documentService.toggle(tripId, documentId);
            await loadDocuments();
            onChanged();
        } catch (err) {
            console.error(err);
            setError("Não foi possível atualizar o documento.");
        }
    }

    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (!form.name.trim()) {
            setError("Informe o nome do documento.");
            return;
        }

        setSaving(true);

        try {
            const data = await documentService.create(tripId, {
                name: form.name.trim(),
                description: normalizeOptional(form.description),
                category: normalizeOptional(form.category),
                isRequired: false,
            });

            setGroups(data);
            setForm(initialForm);
            setIsFormOpen(false);
            onChanged();
        } catch (err) {
            console.error(err);
            setError(getDocumentErrorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    async function handleRemove(documentId: string) {
        if (!confirm("Excluir este documento?")) return;

        try {
            setError(null);
            await documentService.remove(tripId, documentId);
            await loadDocuments();
            onChanged();
        } catch (err) {
            console.error(err);
            setError("Não foi possível excluir o documento.");
        }
    }

    if (loading) {
        return <p className="text-sm text-navy-700 dark:text-[#A7B0BE]">Carregando documentos...</p>;
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-navy-700 dark:text-[#A7B0BE]">
                        Acompanhe os documentos da viagem e adicione itens extras quando precisar.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setError(null);
                        setIsFormOpen(true);
                    }}
                    className="rounded-full border border-burgundy-500/40 px-4 py-2 text-sm font-semibold text-burgundy-500 transition hover:bg-burgundy-600 hover:text-white dark:text-burgundy-300 dark:hover:text-white"
                >
                    + Novo documento
                </button>
            </div>

            {error && (
                <p className="rounded-2xl bg-burgundy-50 px-4 py-3 text-sm font-semibold text-burgundy-600 dark:bg-burgundy-600/15">
                    {error}
                </p>
            )}

            {isFormOpen && (
                <form
                    onSubmit={handleCreate}
                    className="rounded-[1.5rem] border border-burgundy-500/20 bg-white p-4 shadow-sm dark:border-burgundy-500/25 dark:bg-[#181B22]"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm font-semibold text-navy-950 dark:text-white">
                            Nome do documento
                            <input
                                value={form.name}
                                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-burgundy-500 dark:border-[#2B313D] dark:bg-[#11151C] dark:text-white"
                                placeholder="Autorização dos pais"
                            />
                        </label>

                        <label className="space-y-2 text-sm font-semibold text-navy-950 dark:text-white">
                            Tipo/categoria opcional
                            <input
                                value={form.category ?? ""}
                                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-burgundy-500 dark:border-[#2B313D] dark:bg-[#11151C] dark:text-white"
                                placeholder="Autorização"
                            />
                        </label>
                    </div>

                    <label className="mt-4 block space-y-2 text-sm font-semibold text-navy-950 dark:text-white">
                        Descrição opcional
                        <textarea
                            value={form.description ?? ""}
                            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                            className="min-h-24 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-burgundy-500 dark:border-[#2B313D] dark:bg-[#11151C] dark:text-white"
                            placeholder="Para menores de idade"
                        />
                    </label>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setForm(initialForm);
                                setError(null);
                                setIsFormOpen(false);
                            }}
                            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-navy-700 transition hover:border-gray-300 dark:border-[#2B313D] dark:text-[#A7B0BE]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-full bg-burgundy-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-burgundy-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Salvando..." : "Salvar documento"}
                        </button>
                    </div>
                </form>
            )}

            {groups.map((group) => (
                <article
                    key={group.participantId}
                    className="rounded-[2rem] border border-gray-200 bg-gray-50 p-5 dark:border-[#2B313D] dark:bg-[#20242D]"
                >
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold text-white"
                                style={{ backgroundColor: group.avatarColor ?? "#7A102A" }}
                            >
                                {group.participantName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <h3 className="font-display text-2xl font-semibold text-navy-950 dark:text-white">
                                    {group.participantName}
                                </h3>
                                <p className="text-sm text-navy-700 dark:text-[#A7B0BE]">
                                    {group.progress}% dos documentos prontos
                                </p>
                            </div>
                        </div>

                        <span className="rounded-full bg-burgundy-50 px-3 py-1 text-sm font-semibold text-burgundy-600 dark:bg-burgundy-600/15">
                            {group.progress}%
                        </span>
                    </div>

                    <div className="mb-5 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-[#2B313D]">
                        <div
                            className="h-full rounded-full bg-burgundy-600 transition-all"
                            style={{ width: `${group.progress}%` }}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {group.documents.map((document) => (
                            <DocumentItem
                                key={document.id}
                                document={document}
                                onToggle={() => handleToggle(document.id)}
                                onRemove={() => handleRemove(document.id)}
                            />
                        ))}
                    </div>
                </article>
            ))}
        </div>
    );
}

function DocumentItem({
    document,
    onToggle,
    onRemove,
}: {
    document: TripDocument;
    onToggle: () => void;
    onRemove: () => void;
}) {
    const done = document.status === 2;
    const isDefault = isDefaultDocument(document);

    return (
        <article
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${done
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-gray-200 bg-white text-navy-950 hover:border-burgundy-100 dark:border-[#2B313D] dark:bg-[#181B22] dark:text-white"
                }`}
        >
            <button
                type="button"
                onClick={onToggle}
                className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${done
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-burgundy-500/45 bg-transparent text-transparent hover:bg-burgundy-50 dark:border-burgundy-400/45 dark:hover:bg-burgundy-600/10"
                    }`}
                aria-label={done ? "Marcar documento como pendente" : "Marcar documento como concluído"}
            >
                {done ? "✓" : <span aria-hidden="true" className="block h-2.5 w-2.5 rounded-full border border-current opacity-0" />}
            </button>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{document.name}</span>
                    {!isDefault && <ExtraDocumentTag />}
                </div>

                {(document.category || document.description) && (
                    <p className="mt-1 text-xs text-navy-600 dark:text-[#A7B0BE]">
                        {document.category && <strong>{document.category}</strong>}
                        {document.category && document.description ? " · " : ""}
                        {document.description}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="shrink-0 rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-navy-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:text-[#A7B0BE] dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
                Remover
            </button>
        </article>
    );
}

function ExtraDocumentTag() {
    return (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-[#A7B0BE]">
            Extra
        </span>
    );
}

function normalizeOptional(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
}

function isDefaultDocument(document: TripDocument) {
    if (document.isDefault !== undefined && document.isDefault !== null) {
        return document.isDefault;
    }

    return defaultDocumentNames.has(normalizeDocumentName(document.name));
}

function normalizeDocumentName(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

const defaultDocumentNames = new Set([
    "Documento De Identidade",
    "Passagens",
    "Reserva Da Hospedagem",
    "Passaporte",
    "Seguro Viagem",
]);

function getDocumentErrorMessage(err: unknown) {
    if (axios.isAxiosError(err)) {
        if (err.response?.status === 404 || err.response?.status === 405) {
            return "Não foi possível salvar o documento.";
        }
    }

    return "Não foi possível salvar o documento.";
}
