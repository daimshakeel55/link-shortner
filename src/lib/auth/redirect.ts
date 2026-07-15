export function navigateAfterAuth(path: string) {
  const destination =
    path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
  window.location.replace(destination);
}
