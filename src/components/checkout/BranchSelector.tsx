import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Branch {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

interface BranchSelectorProps {
  selectedBranch: number;
  setSelectedBranch: (id: number) => void;
  branches: Branch[];
}

const BranchSelector: React.FC<BranchSelectorProps> = ({ selectedBranch, setSelectedBranch, branches }) => (
  <div className="pb-2">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Select Branch</h2>
    <RadioGroup
      value={String(selectedBranch)}
      onValueChange={(val) => setSelectedBranch(Number(val))}
      className="flex flex-wrap gap-4 mt-2"
      aria-label="Branch selection"
    >
      {branches.map((branch) => (
        <label
          key={branch.id}
          htmlFor={`branch-${branch.id}`}
          className={`flex items-center px-6 py-3 rounded-xl font-semibold cursor-pointer border-2 transition-all duration-200 shadow-sm text-base min-w-[180px] justify-between gap-2
            ${selectedBranch === branch.id
              ? "bg-orange-500/90 text-white border-orange-500 shadow-lg"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700"}
          `}
        >
          <RadioGroupItem
            value={String(branch.id)}
            id={`branch-${branch.id}`}
            className="sr-only"
          />
          <span>{branch.name}</span>
          {branch.id === 1 && (
            <span className="ml-2 text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              main
            </span>
          )}
        </label>
      ))}
    </RadioGroup>
  </div>
);

export default BranchSelector; 