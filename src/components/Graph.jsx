import '../style/Graph.css';
import { ForceGraph3D } from 'react-force-graph';
import { Data } from './GraphData/graphData';
import {
  CSS2DRenderer,
  CSS2DObject,
} from '//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js';
import { useEffect, useState, useCallback } from 'react';
import { WeightedGraph } from './GraphData/Logic';
import scroll from '../assets/scroll.png';
import left from '../assets/left-click.png';

const Graph = () => {
  const extraRenderers = [new CSS2DRenderer()];
  const [info, setInfo] = useState(Data);
  const [WeightedGraph1, setWeightedGraph1] = useState(null);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [inputnodevalue, setInputNodeValue] = useState('');
  const [inputnodelink1, setInputNodeLink1] = useState('');
  const [inputnodelinksize, setInputNodeLinkSize] = useState('');
  const [shortestPath, setShortestPath] = useState([]);
  const [error, setError] = useState('');

  const randomize = () => {
    const newnodes = info.nodes.filter(
      (item, i) => (
        (item.value = item.id = Math.floor(Math.random() * 850 + (i + 1))),
        (item.color = 'lightblue')
      )
    );

    const newlinks = info.links.filter(
      (item) => (
        (item.size = Math.floor(Math.random() * 20 + 1)),
        (item.color = 'purple'),
        (item.source =
          info.nodes[Math.floor(Math.random() * info.nodes.length)]),
        (item.target =
          info.nodes[Math.floor(Math.random() * info.nodes.length)])
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
      setInput1('');
      setInput2('');
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

  const AddNode = (value, link, size) => {
    setInfo({
      nodes: [
        ...info.nodes,
        {
          id: parseInt(value),
          value: parseInt(value),
          color: 'lightblue',
        },
      ],
      links: [
        ...info.links,
        {
          source: parseInt(link),
          target: parseInt(value),
          size: parseInt(size),
          color: 'purple',
        },
      ],
    });

    setInputNodeValue('');
    setInputNodeLink1('');
    setInputNodeLinkSize('');
  };

  const handleRemoveNode = useCallback(
    (node) => {
      const newLinks = info.links.filter(
        (l) => l.source !== node && l.target !== node
      );
      const newnodes = info.nodes.filter((n) => n.id !== node.id);

      setInfo({ nodes: newnodes, links: newLinks });
    },
    [info, setInfo]
  );

  useEffect(() => {
    Addinfo();
  }, [info]);

  return (
    <div className="graph">
      <ForceGraph3D
        backgroundColor={'lightgrey'}
        onNodeClick={handleRemoveNode}
        showNavInfo={true}
        width={1000}
        height={600}
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
            value={input1}
            placeholder="Enter the start node"
          />
          <input
            type="number"
            onChange={(e) => setInput2(e.target.value)}
            value={input2}
            placeholder="Enter the finish node"
          />
        </div>

        <button onClick={() => shortestPathbetweentwonodes(input1, input2)}>
          {' '}
          ShortestPath
        </button>
        <div className="shortest">{shortestPath.join('==>')}</div>
        <div className="error">{error}</div>
        <div className="AddNewNode">
          <input
            type="number"
            onChange={(e) => setInputNodeValue(e.target.value)}
            value={inputnodevalue}
            placeholder="Enter the node value"
          />
          <input
            type="number"
            onChange={(e) => setInputNodeLink1(e.target.value)}
            value={inputnodelink1}
            placeholder="Enter the node you want to link it to"
          />
          <input
            type="number"
            onChange={(e) => setInputNodeLinkSize(e.target.value)}
            value={inputnodelinksize}
            placeholder="Enter the link size"
          />
          <button
            onClick={() =>
              AddNode(inputnodevalue, inputnodelink1, inputnodelinksize)
            }
          >
            Add node
          </button>
        </div>
        <div className='RemoveNode'>
          To Remove: Just click on a Node.
        </div>
        <div className="key">
          <div className="zoom">
            <img width={40} height={35} src={scroll} />
            <h6>Zoom In/Out</h6>
          </div>
          <div className="zoom">
            <img width={40} height={35} src={left} />
            <h6>Click to rotate</h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graph;
