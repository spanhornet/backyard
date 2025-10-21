// UI Components
import Container from "@/components/container";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container className="py-8">
      {children}
    </Container>
  );
}
