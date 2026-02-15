import { TripForm } from "@/components/trips/TripForm";

export const metadata = {
  title: "Новая поездка — Travel World",
};

export default function NewTripPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <TripForm />
    </div>
  );
}
