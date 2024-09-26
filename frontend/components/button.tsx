import { ReactNode } from "react";
import { Button as TailwindButton } from "@headlessui/react";

export default function Button({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <TailwindButton
      onClick={onClick}
      className="inline-flex items-center gap-2 text-xs rounded-md bg-gray-700 py-1 px-2 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-orange-400 data-[open]:bg-orange-400 data-[focus]:outline-1 data-[focus]:outline-orange-200"
    >
      {children}
    </TailwindButton>
  );
}
