import { Suite } from 'benchmark';
import v8 from 'v8';
import clone from 'clone';
import cloneDeep from 'clone-deep';
import rfdc from 'rfdc';

const rfdcProto = rfdc({ proto: true, circles: false });
const rfdcNoProto = rfdc({ proto: false, circles: false });

const obj = {
  '_id': '5fa7efa52dcd3b71ce0634d8',
  'index': 2,
  'guid': 'f40b737e-923e-40ae-b074-805fac15a8e4',
  'isActive': false,
  'balance': '$3,256.13',
  'picture': 'http://placehold.it/32x32',
  'age': 38,
  'eyeColor': 'brown',
  'name': 'Richards Christensen',
  'gender': 'male',
  'company': 'COGNICODE',
  'email': 'richardschristensen@cognicode.com',
  'phone': '+1 (908) 450-2485',
  'address': '400 Vernon Avenue, Cumminsville, Ohio, 8086',
  'about': 'Voluptate nostrud aliqua ex veniam occaecat amet amet duis ullamco ex ea nostrud culpa sint. Est magna est labore eiusmod sit magna velit id pariatur. Exercitation minim est duis duis pariatur et. Commodo magna culpa eiusmod tempor enim. Cupidatat et dolor voluptate laborum veniam. Irure sint exercitation dolor quis mollit dolor commodo exercitation consequat. Ea nostrud irure irure eiusmod voluptate.\r\n',
  'registered': '2014-11-03T10:36:22 -03:00',
  'latitude': 49.873363,
  'longitude': 79.46254,
  'tags': [
    'commodo',
    'ea',
    'reprehenderit',
    'anim',
    'culpa',
    'nostrud',
    'dolore'
  ],
  'friends': [
    {
      'id': 0,
      'name': 'Lucile Woods'
    },
    {
      'id': 1,
      'name': 'Pearson Poole'
    },
    {
      'id': 2,
      'name': 'Stephenson Acosta'
    }
  ],
  'greeting': 'Hello, Richards Christensen! You have 2 unread messages.',
  'favoriteFruit': 'banana'
};

new Suite('Serialize', {
  onStart: (ev) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#v8', async () => {
    const res = v8.serialize(obj);
  })
  .add('#JSON', async () => {
    const res = JSON.stringify(obj);
  })
  .add('#clone', async () => {
    const res = clone(obj);
  })
  .add('#clone-deep', async () => {
    const res = cloneDeep(obj);
  })
  .add('#rfdc no proto', async () => {
    const res = rfdcNoProto(obj);
  })
  .add('#rfdc proto', async () => {
    const res = rfdcProto(obj);
  })
  .run();

new Suite('Real world (1 store and 5 fetches)', {
  onStart: (ev) => {
    console.log(String(ev.currentTarget.name));
  },
  onCycle: (ev) => {
    console.log(' ' + String(ev.target));
  },
  onComplete: (ev) => {
    console.log('Fastest is ' + ev.currentTarget.filter('fastest').map('name') + '\n');
  },
})
  .add('#v8', async () => {
    const res = v8.serialize(obj);

    const res1 = v8.deserialize(res);
    const res2 = v8.deserialize(res);
    const res3 = v8.deserialize(res);
    const res4 = v8.deserialize(res);
    const res5 = v8.deserialize(res);
  })
  .add('#JSON', async () => {
    const res = JSON.stringify(obj);

    const res1 = JSON.parse(res);
    const res2 = JSON.parse(res);
    const res3 = JSON.parse(res);
    const res4 = JSON.parse(res);
    const res5 = JSON.parse(res);
  })
  .add('#clone', async () => {
    const res = clone(obj);

    const res1 = clone(res);
    const res2 = clone(res);
    const res3 = clone(res);
    const res4 = clone(res);
    const res5 = clone(res);
  })
  .add('#clone-deep', async () => {
    const res = cloneDeep(obj);

    const res1 = cloneDeep(res);
    const res2 = cloneDeep(res);
    const res3 = cloneDeep(res);
    const res4 = cloneDeep(res);
    const res5 = cloneDeep(res);
  })
  .add('#rfdc no proto', async () => {
    const res = rfdcNoProto(obj);

    const res1 = rfdcNoProto(res);
    const res2 = rfdcNoProto(res);
    const res3 = rfdcNoProto(res);
    const res4 = rfdcNoProto(res);
    const res5 = rfdcNoProto(res);
  })
  .add('#rfdc proto', async () => {
    const res = rfdcProto(obj);

    const res1 = rfdcProto(res);
    const res2 = rfdcProto(res);
    const res3 = rfdcProto(res);
    const res4 = rfdcProto(res);
    const res5 = rfdcProto(res);
  })
  .run({ async: true });
