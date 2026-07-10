import { useEffect, useState } from "react";
import { avatarOptions, type AvatarKey } from "../../data/avatarOptions";

type AvatarPickerModalProps = {
  open: boolean;
  currentAvatarKey?: string | null;
  onClose: () => void;
  onSave: (avatarKey: AvatarKey) => Promise<void> | void;
  loading?: boolean;
};

export default function AvatarPickerModal({
  open,
  currentAvatarKey,
  onClose,
  onSave,
  loading = false,
}: AvatarPickerModalProps) {
  const savedAvatarKey = isAvatarKey(currentAvatarKey) ? currentAvatarKey : null;
  const [selectedAvatarKey, setSelectedAvatarKey] = useState<AvatarKey | null>(savedAvatarKey);
  const [error, setError] = useState("");
  const canSave = Boolean(selectedAvatarKey) && selectedAvatarKey !== savedAvatarKey && !loading;

  useEffect(() => {
    if (!open) return;
    setSelectedAvatarKey(savedAvatarKey);
    setError("");
  }, [savedAvatarKey, open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose, open]);

  if (!open) return null;

  async function handleSave() {
    if (!selectedAvatarKey || !canSave) return;

    try {
      setError("");
      await onSave(selectedAvatarKey);
    } catch {
      setError("Não foi possível salvar o avatar. Tente novamente.");
    }
  }

  return (
    <div className="avatar-picker-overlay" role="presentation" onMouseDown={loading ? undefined : onClose}>
      <div
        className="avatar-picker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-picker-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="avatar-picker-header">
          <div>
            <p className="avatar-picker-kicker">Quem está viajando?</p>
            <h2 id="avatar-picker-title">Escolha seu avatar</h2>
            <span>Esse será o seu perfil dentro da viagem.</span>
          </div>

          <button type="button" className="avatar-picker-close" onClick={onClose} disabled={loading}>
            Fechar
          </button>
        </div>

        <div className="avatar-picker-grid">
          {avatarOptions.map((avatar) => {
            const selected = avatar.key === selectedAvatarKey;

            return (
              <button
                key={avatar.key}
                type="button"
                className={`avatar-picker-card ${selected ? "is-selected" : ""}`}
                onClick={() => {
                  setSelectedAvatarKey(avatar.key);
                  setError("");
                }}
                disabled={loading}
              >
                <span className="avatar-picker-image">
                  <img
                    src={avatar.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={220}
                    height={220}
                  />
                </span>

                {selected && (
                  <span className="avatar-picker-check">
                    ✓
                    <span>Selecionado</span>
                  </span>
                )}

                <strong>{avatar.label}</strong>
              </button>
            );
          })}
        </div>

        <div className="avatar-picker-footer">
          {error && <p className="avatar-picker-error">{error}</p>}

          <button type="button" className="avatar-picker-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>

          <button
            type="button"
            className="avatar-picker-save"
            onClick={handleSave}
            disabled={!canSave}
          >
            {loading ? "Salvando..." : "Salvar avatar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function isAvatarKey(value?: string | null): value is AvatarKey {
  return avatarOptions.some((avatar) => avatar.key === value);
}
