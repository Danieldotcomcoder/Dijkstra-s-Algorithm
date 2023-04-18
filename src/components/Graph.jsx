import '../style/Graph.css';
import { ForceGraph3D } from 'react-force-graph';
import { Data } from './GraphData/graphData';
import {
  CSS2DRenderer,
  CSS2DObject,
} from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';

const Graph = () => {
  const extraRenderers = [new CSS2DRenderer()];
  return (
    <div>
      <ForceGraph3D
        width={700}
        height={500}
        graphData={Data}
        linkWidth={0.3}
        extraRenderers={extraRenderers}
        nodeColor={(node) => {
          return node.color;
        }}
        nodeRelSize={2}
        nodeResolution={15}
        nodeThreeObject={(node) => {
          const nodeEl = document.createElement('div');
          nodeEl.textContent = node.val;
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
    </div>
  );
};

export default Graph;
