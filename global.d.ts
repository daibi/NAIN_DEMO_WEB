/*
 * @Author: daibi dbfornewsletter@outlook.com
 * @Date: 2023-02-19 11:32:02
 * @LastEditors: daibi dbfornewsletter@outlook.com
 * @LastEditTime: 2023-02-19 11:32:10
 * @FilePath: /precedent/global.d.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window{
    ethereum?:MetaMaskInpageProvider
  }
}