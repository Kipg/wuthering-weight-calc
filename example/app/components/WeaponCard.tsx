import Image from "next/image";
import { getWeaponImagePath } from "@/lib/imageHelper";

// 获取稀有度对应的边框颜色和发光效果
const getRarityBorderColor = (rarity: number) => {
  switch(rarity) {
    case 5: return "border-yellow-400 animate-pulse-glow";
    case 4: return "border-purple-500";
    case 3: return "border-blue-500";
    default: return "border-gray-300";
  }
};

interface WeaponCardProps {
  name: string;
  imageKey: string;
  rarity: number;
  weaponType: string;
  onClick?: () => void;
  variant?: "display" | "select"; // display用于主面板，select用于选择弹窗
}

export const WeaponCard = ({ 
  name, 
  imageKey, 
  rarity, 
  weaponType, 
  onClick,
  variant = "display"
}: WeaponCardProps) => {
  if (variant === "display") {
    // 主面板显示样式
    return (
      <div className={`w-40 h-50 bg-white rounded-lg flex items-center justify-center overflow-hidden border-4 ${getRarityBorderColor(rarity)}`}>
        <Image
          src={getWeaponImagePath(imageKey)}
          alt={name}
          width={150}
          height={150}
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  // 选择弹窗样式
  return (
    <button
      onClick={onClick}
      className={`p-0 border-7 ${getRarityBorderColor(rarity)} rounded-lg hover:border-blue-500 transition-colors text-left bg-white`}
    >
      <div className={`w-46 h-63 rounded mb-1 flex items-center justify-center overflow-hidden`}>
        <Image
          src={getWeaponImagePath(imageKey)}
          alt={name}
          width={300}
          height={300}
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <p className="text-center font-semibold text-gray-800">{name}</p>
      <p className="text-center text-gray-600">{rarity}星 · {weaponType}</p>
    </button>
  );
};
