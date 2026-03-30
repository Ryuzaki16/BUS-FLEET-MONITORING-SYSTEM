// components/BusInfoPublicPage.tsx
import { useParams, useNavigate } from "react-router";
import { BusInfoPublic } from "./BusInfoPublic";

export function BusInfoPublicPage() {
  const { busId } = useParams<{ busId: string }>();
  const navigate = useNavigate();

  if (!busId) return <div>Bus not found</div>;

  return (
    <BusInfoPublic
      busId={busId}
      busqrCodeId={true}
      onClose={() => navigate(-1)}
    />
  );
}