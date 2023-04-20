import '../style/Graph.css';
import { ForceGraph3D } from 'react-force-graph';
import { Data } from './GraphData/graphData';
import {
  CSS2DRenderer,
  CSS2DObject,
} from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';
import { useEffect, useState } from 'react';

const Graph = () => {
  const extraRenderers = [new CSS2DRenderer()];
  const [info, setInfo] = useState(Data);
  const randomize = () => {
    const newnodes = info.nodes.filter(
      (item) => (item.value = Math.floor(Math.random() * (100 - 1 + 1) + 1))
    );
    const newlinks = info.links.filter(
      (item) => (item.size = Math.floor(Math.random() * (10) + 1))
    );

    setInfo({ nodes: newnodes, links: newlinks });
  };

  return (
    <div>
      <ForceGraph3D
        width={700}
        height={500}
        graphData={info}
        linkWidth={0.3}
        extraRenderers={extraRenderers}
        nodeLabel={'value'}
        nodeColor={(node) => {
          return node.color;
        }}
        nodeRelSize={2}
        nodeResolution={15}
        nodeThreeObject={(node) => {
          const nodeEl = document.createElement('div');
          console.log(node);
          nodeEl.textContent = node.value;

          return new CSS2DObject(nodeEl);
        }}
        nodeThreeObjectExtend={true}
        linkThreeObjectExtend={true}
        linkThreeObject={(link) => {
          const sprite = new SpriteText(link.size);
          sprite.color = 'lightgrey';
          sprite.textHeight = 2.5;
          return sprite;
        }}
        linkPositionUpdate={(sprite, { start, end }) => {
          const middlePos = Object.assign(
            ...['x', 'y', 'z'].map((c) => ({
              [c]: start[c] + (end[c] - start[c]) / 2,
            }))
          );

          Object.assign(sprite.position, middlePos);
        }}
      />
      <button onClick={() => randomize()}> Randomize</button>
    </div>
  );
};

export default Graph;
