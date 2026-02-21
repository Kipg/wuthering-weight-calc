import Image from "next/image";
import { getEchoImagePath } from "@/lib/imageHelper";

interface EchoCardProps {
  name: string;
  imageKey: string;
  cost: number;
  possibleSets: string[];
  onClick?: () => void;
}

export const EchoCard = ({ 
  name, 
  imageKey, 
  cost, 
  possibleSets, 
  onClick 
}: EchoCardProps) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-gray-50 rounded-lg p-2 border-2 border-gray-200 hover:border-blue-400 transition-all"
    >
      <div className="w-full aspect-square bg-white rounded mb-2 flex items-center justify-center overflow-hidden">
        <Image
          src={getEchoImagePath(imageKey)}
          alt={name}
          width={200}
          height={200}
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-600">COST {cost}</p>
        <p className="text-xs text-blue-600 truncate">{possibleSets[0]}</p>
      </div>
    </div>
  );
};
