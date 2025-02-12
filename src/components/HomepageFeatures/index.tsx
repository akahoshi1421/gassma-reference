import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "より易しく",
    Svg: require("@site/static/img/jsAndTs.svg").default,
    description: (
      <>
        スプレッドシートは様々な人が使います。ですが、全員が普段からJavaScriptを書いている訳ではなりません。
        GASsmaを使えば複雑な処理を書きこともなくデータを抽出したり更新したりすることができます。
      </>
    ),
  },
  {
    title: "より管理しやすく",
    Svg: require("@site/static/img/GoogleAppsScript.svg").default,
    description: (
      <>
        スプレッドシートのここの行を取得したり、取得したものを条件付きでソートを行ったり...と言ったことをしたい場合、複雑な配列処理を行わないといけません。
        するとコードが膨大化し、可読性が低下します。GASsmaはこれらの問題を解決し、コード量を抑えます。
      </>
    ),
  },
  {
    title: "よりミスを減らす",
    Svg: require("@site/static/img/GoogleSheets.svg").default,
    description: (
      <>
        スプレッドシートをGASで扱う際、<code>getRange()</code>
        を利用して行番号や列番号を指定します。これは数え間違えのリスクが発生します。
        しかし、GASsmaは列名やシートの範囲も自動で読んでくれます。あなたはシートの範囲を数える必要がありません。
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
