import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { Button } from "./ui/button";
import { CloseSquare } from "iconsax-react";
import { twMerge } from "tailwind-merge";

interface ModalProp {
  isOpen?: boolean;
  onClose?: () => void;
  showCloseIcon?: boolean;
  children?: React.ReactNode;
  isBlurBg?: boolean;
  fixed?: boolean;
  scrollable?: boolean;
}

const Modal = ({
  children,
  isOpen,
  showCloseIcon,
  onClose,
  fixed,
  scrollable,
}: ModalProp) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const blurBg = `backdrop-blur-xl opacity-[1]`;
  const transBg = ``;

  React.useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClickOutside = (e: Event) => {
    const tgt = (e.target as any)?.dataset;
    const name = tgt.name;
    name && onClose;
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.classList.remove("modal-open");
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={twMerge(
        `w-full hideScrollBar backdrop-blur bg-dark-600 bg-opacity-85 h-[100vh] ${
          fixed ? "fixed z-[250px]" : "absolute"
        } top-0 left-0 z-[50] py-5`,
        scrollable ? "overflow-y-auto hideScollBar" : "overflow-hidden"
      )}
      data-name="main-modal"
    >
      <div className={`${isVisible ? "opacity-100" : "opacity-0"}`}>
        {showCloseIcon && (
          <div className="absolute top-5 right-0 p-1 z-[70]">
            <CloseSquare
              size="32"
              className="cursor-pointer text-red-305 "
              variant="Bold"
              onClick={onClose}
            />
          </div>
        )}
        <div className="relative w-full h-screen">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

export const ChildBlurModal = ({
  children,
  isOpen,
  showCloseIcon,
  onClose,
  fixed,
  scrollable,
}: ModalProp) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const blurBg = `backdrop-blur-xl opacity-[1]`;
  const transBg = ``;

  React.useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClickOutside = (e: Event) => {
    const tgt = (e.target as any)?.dataset;
    const name = tgt.name;
    name && onClose;
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.classList.remove("modal-open");
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={twMerge(
        `w-full hideScrollBar backdrop-blur bg-dark-600 bg-opacity-85 h-[100vh] ${
          fixed ? "fixed z-[250px]" : "absolute"
        } top-0 left-0 z-[50] py-5`,
        scrollable ? "overflow-y-auto hideScollBar" : "overflow-hidden"
      )}
    >
      <div className={`${isVisible ? "opacity-100" : "opacity-0"}`}>
        {showCloseIcon && (
          <div className="absolute top-3 right-0 p-1 z-[70]">
            <CloseSquare />
          </div>
        )}
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  );
};
