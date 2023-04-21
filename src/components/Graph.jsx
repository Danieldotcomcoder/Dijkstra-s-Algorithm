import '../style/Graph.css';
import { ForceGraph3D } from 'react-force-graph';
import { Data } from './GraphData/graphData';
import {
  CSS2DRenderer,
  CSS2DObject,
} from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';
import { useEffect, useState } from 'react';
import { WeightedGraph } from './GraphData/Logic';

const Graph = () => {
  const extraRenderers = [new CSS2DRenderer()];
  const [info, setInfo] = useState(Data);
  const [WeightedGraph1, setWeightedGraph1] = useState(null);
  const [input1, setInput1] = useState(null);
  const [input2, setInput2] = useState(null);
  const [shortestPath, setShortestPath] = useState([]);

  const randomize = () => {
    const newnodes = info.nodes.filter(
      (item) => (item.value = Math.floor(Math.random() * 100 + 1))
    );
    const newlinks = info.links.filter(
      (item) => (item.size = Math.floor(Math.random() * 10 + 1))
    );

    setInfo({ nodes: newnodes, links: newlinks });
  };

  const Addinfo = () => {
    let wg = new WeightedGraph();
    info.nodes.map((item) => wg.addVertex(item.value));

    info.links.map((item) => {
      if (item.source.value) {
        wg.addEdge(item.source.value, item.target.value, item.size);
      } else {
        wg.addEdge(item.source, item.target, item.size);
      }
    });

    setWeightedGraph1(wg);
  };

  const shortestPathbetweentwonodes = (num1, num2) => {
    let wg1 = new WeightedGraph();
    wg1 = WeightedGraph1;
    
    setShortestPath(wg1.Dijkstra(num1, num2));
    changecolor(wg1.Dijkstra(num1, num2));
  };

  const changecolor = (shortestPath) => {
    const filternodes = (node) => {
             
      if(shortestPath.includes(node.value) === true || shortestPath.includes(node.value.toString()) === true){
       return node.color = 'red'
      } else {
        return node.color = 'lightgrey'
      }
    }
    const newnodes = info.nodes.filter(filternodes);

    setInfo({ nodes: newnodes, links: info.links });
  };

  useEffect(() => {
    Addinfo();
  }, [info]);

  return (
    <div className='graph'>
      <ForceGraph3D
        width={700}
        height={550}
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
      <div className='sidepanel'>
        <button onClick={() => randomize()}> Randomize</button>

        <input type="number" onChange={(e) => setInput1(e.target.value)} placeholder='Enter the start node' />
        <input type="number" onChange={(e) => setInput2(e.target.value)} placeholder='Enter the finish node' />
        <button onClick={() => shortestPathbetweentwonodes(input1, input2)}>
          {' '}
          ShortestPath
        </button>
        <div>{shortestPath.join('==>')}</div>
      </div>
    </div>
  );
};

export default Graph;
