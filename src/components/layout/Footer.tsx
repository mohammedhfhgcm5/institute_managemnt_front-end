export function Footer() {
  return (
    <footer className="border-t bg-card px-4 py-3">
      <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} نظام إدارة المدرسة. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
