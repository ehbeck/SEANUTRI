// This file is required for TypeScript to recognise the jpg/png imports
// in the certificate generation
declare module "*.jpg" {
    const content: string;
    export default content;
  }
  
  declare module "*.png" {
    const content: string;
    export default content;
  }

  declare module 'qrcode.react' {
    import { SVGProps, Ref } from 'react';
    type QRCodeProps = {
        value: string;
        size?: number;
        level?: 'L' | 'M' | 'Q' | 'H';
        bgColor?: string;
        fgColor?: string;
        style?: React.CSSProperties;
        includeMargin?: boolean;
        imageSettings?: {
            src: string;
            x?: number;
            y?: number;
            height: number;
            width: number;
            excavate?: boolean;
        };
    } & SVGProps<SVGSVGElement>;
    const QRCode: (props: QRCodeProps & { ref?: Ref<SVGSVGElement> }) => JSX.Element;
    export default QRCode;
}

