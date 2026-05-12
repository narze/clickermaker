import { Designer } from "@/components/designer"
import { th } from "@/lib/i18n/th"

export default function Page() {
  const mainUrl = process.env.NEXT_PUBLIC_SHOP_URL || "https://geekcraft.shop"
  const messaengerUrl =
    process.env.NEXT_PUBLIC_MESSENGER_URL || "https://m.me/geekcraftbkk"

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 w-full max-w-6xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
          GeekCraft
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          {th.page.title}
        </h1>
        <p className="mt-2 text-sm text-neutral-500 sm:text-base">
          {th.page.description}
        </p>
        <p className="mt-3 text-sm">
          Order your clicker -{" "}
          <a
            href={messaengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-pink-600 underline decoration-pink-300 underline-offset-2 hover:text-pink-700"
          >
            Facebook @geekcraftbkk
          </a>
        </p>
      </header>

      <Designer />

      <footer className="mt-10 w-full max-w-6xl text-center text-xs text-neutral-400">
        <a
          href={mainUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-neutral-500 underline-offset-2 hover:text-pink-500 hover:underline"
        >
          {th.page.by}
        </a>
      </footer>
    </main>
  )
}
