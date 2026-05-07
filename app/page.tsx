import { Designer } from "@/components/designer"

export default function Page() {
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || "#"

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 w-full max-w-6xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
          GeekCraft
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          Clicker Maker
        </h1>
        <p className="mt-2 text-sm text-neutral-500 sm:text-base">
          Design your own custom clicker fidget toy. Type, pick colors, save the
          image, then order it 3D-printed.
        </p>
      </header>

      <Designer />

      <footer className="mt-10 w-full max-w-6xl text-center text-xs text-neutral-400">
        <a
          href={shopUrl}
          target={shopUrl === "#" ? undefined : "_blank"}
          rel="noreferrer"
          className="font-medium text-neutral-500 underline-offset-2 hover:text-pink-500 hover:underline"
        >
          by GeekCraft
        </a>
      </footer>
    </main>
  )
}
