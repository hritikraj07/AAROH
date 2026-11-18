import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/oversized-404-numeral-utils/button";

export default function ErrorBlock() {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-[70vh] w-full items-center justify-center px-6 py-16 text-slate-900 dark:text-slate-100 font-sans">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span
          className="text-[8rem] leading-none font-bold tracking-tighter text-slate-900 dark:text-slate-100 tabular-nums select-none sm:text-[11rem]"
          aria-hidden="true"
        >
          404
        </span>
        <h1 className="-mt-2 text-2xl font-bold tracking-tight sm:text-3xl text-slate-900 dark:text-slate-100">
          This page took a wrong turn
        </h1>
        <p className="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-400">
          The page you are looking for does not exist or may have been moved. Let us get you back on track.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" aria-hidden="true" />
            Go home
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Go back
          </Button>
        </div>
      </div>
    </section>
  );
}

export { ErrorBlock };
