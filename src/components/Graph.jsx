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
  const [error, setError] = useState('');

  const randomize = () => {
    const newnodes = info.nodes.filter(
      (item) => (
        (item.value = Math.floor(Math.random() * 1000 + 1)),
        (item.color = 'lightblue')
      )
    );

    const newlinks = info.links.filter(
      (item) => (
        (item.size = Math.floor(Math.random() * 20 + 1)),
        (item.color = 'purple')
      )
    );

    setInfo({ nodes: newnodes, links: newlinks });
    setShortestPath([]);
    setError('');
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
    if (wg1.adjacencyList[num1] && wg1.adjacencyList[num2]) {
      setShortestPath(wg1.Dijkstra(num1, num2));
      changecolor(wg1.Dijkstra(num1, num2));
      setError('');
    } else {
      setError('Make sure both nodes exist in graph');
    }
  };

  const changecolor = (shortestPath) => {
    const filternodes = (node) => {
      if (
        shortestPath.includes(node.value) === true ||
        shortestPath.includes(node.value.toString()) === true
      ) {
        return (node.color = 'red');
      } else {
        return (node.color = 'lightblue');
      }
    };
    const filterlinks = (links) => {
      if (
        (shortestPath.includes(links.source.value) ||
          shortestPath.includes(links.source.value.toString())) &&
        (shortestPath.includes(links.target.value) ||
          shortestPath.includes(links.target.value.toString()))
      ) {
        return (links.color = 'red');
      } else {
        return (links.color = 'purple');
      }
    };
    const filteredlinks = info.links.filter(filterlinks);
    const newnodes = info.nodes.filter(filternodes);

    setInfo({ nodes: newnodes, links: filteredlinks });
  };

  useEffect(() => {
    Addinfo();
  }, [info]);

  return (
    <div className="graph">
      <ForceGraph3D
        backgroundColor={'grey'}
        showNavInfo={true}
        width={1000}
        height={550}
        nodeVal={10}
        enableNodeDrag={false}
        graphData={info}
        linkWidth={1}
        extraRenderers={extraRenderers}
        linkColor={(link) => {
          return link.color;
        }}
        nodeLabel={'value'}
        nodeColor={(node) => {
          return node.color;
        }}
        nodeRelSize={2}
        nodeResolution={15}
        nodeThreeObject={(node) => {
          const nodeEl = document.createElement('div');
          nodeEl.className = 'node';
          nodeEl.textContent = node.value;
          return new CSS2DObject(nodeEl);
        }}
        nodeThreeObjectExtend={true}
        linkThreeObjectExtend={true}
        linkThreeObject={(link) => {
          const sprite = new SpriteText(link.size);
          sprite.color = 'black';
          sprite.textHeight = 3;
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
      <div className="sidepanel">
        <button onClick={() => randomize()}> Randomize</button>
        <div className="input">
          {' '}
          <input
            type="number"
            onChange={(e) => setInput1(e.target.value)}
            placeholder="Enter the start node"
          />
          <input
            type="number"
            onChange={(e) => setInput2(e.target.value)}
            placeholder="Enter the finish node"
          />
        </div>

        <button onClick={() => shortestPathbetweentwonodes(input1, input2)}>
          {' '}
          ShortestPath
        </button>
        <div className="shortest">{shortestPath.join('==>')}</div>
        <div className="error">{error}</div>
      </div>
    </div>
  );
};

export default Graph;
