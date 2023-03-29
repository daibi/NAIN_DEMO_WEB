/*
 * @Author: daibi dbfornewsletter@outlook.com
 * @Date: 2023-02-22 22:48:58
 * @LastEditors: daibi dbfornewsletter@outlook.com
 * @LastEditTime: 2023-02-22 23:24:41
 * @FilePath: /precedent/components/common/MessageCard.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect } from "react";
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

interface MessageCardProps {
  message: string;
  type: "success" | "error" | "loading";
  onClose: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, type, onClose }) => {
  const [icon, setIcon] = useState<JSX.Element | null>(null);
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    switch (type) {
      case "success":
        setIcon(<CheckCircleIcon className="h-6 w-6" />);
        setColor("bg-green-100 border-green-400 text-green-700");
        break;
      case "error":
        setIcon(<XCircleIcon className="h-6 w-6" />);
        setColor("bg-red-100 border-red-400 text-red-700");
        break;
      case "loading":
        setIcon(<ArrowPathIcon className="h-6 w-6 animate-spin" />);
        setColor("bg-blue-100 border-blue-400 text-blue-700");
        break;
      default:
        setIcon(null);
        setColor("");
        break;
    }
  }, [type]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-2">
      <div className={`border ${color} px-4 py-3 rounded relative`} role="alert">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {icon}
            <span className="ml-2">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 ml-4 rounded-md text-gray-600 hover:text-gray-500 focus:outline-none focus:shadow-outline-gray focus:border-gray-300 transition ease-in-out duration-150"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 11.414l4.95 4.95 1.414-1.414L11.414 10l4.95-4.95-1.414-1.414L10 8.586 5.05 3.636 3.636 5.05 8.586 10l-4.95 4.95 1.414 1.414L10 11.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
export default MessageCard;