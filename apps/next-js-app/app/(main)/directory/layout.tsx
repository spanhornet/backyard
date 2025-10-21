import Container from "@/components/container";

export default function DirectoryLayout({
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

