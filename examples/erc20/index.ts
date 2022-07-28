import {AccountId, u128 } from "ask-lang";
import { ERC20 } from "./ERC20";

@contract
export class MyToken extends ERC20 {
    @constructor()
    default(name: string, symbol: string): void {
        super.default(name, symbol);
    }

    @message({ mutates: true})
    mint(to: AccountId, amount: u128): void {
        this._mint(to, amount);
    }

    @message({ mutates: true})
    burn(from: AccountId, amount: u128): void {
        this._burn(from, amount);
    }
}
