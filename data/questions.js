/*
 * ENARSI (300-410) practice question bank.
 *
 * Each question:
 *   id          unique string
 *   domain      exam blueprint domain
 *   topic       sub-topic shown as a tag
 *   question    question text (multi-answer questions say "Choose two." etc.)
 *   exhibit     optional CLI output / config shown as "Refer to the exhibit"
 *   options     answer choices
 *   answer      array of indexes into options (more than one = multi-select)
 *   explanation shown after answering
 *
 * Loaded as a plain script (not fetched JSON) so the site also works from file://.
 */
window.ENARSI_QUESTIONS = [
  // ───────────────────────── Layer 3 Technologies ─────────────────────────
  {
    id: "ad-1",
    domain: "Layer 3 Technologies",
    topic: "Administrative Distance",
    question:
      "A router learns 10.10.10.0/24 from OSPF (intra-area) and from EIGRP as an external route. Both protocols are using default settings. Which route is installed in the routing table?",
    options: [
      "The EIGRP route, because EIGRP external routes have an administrative distance of 90",
      "The OSPF route, because its administrative distance of 110 is lower than 170",
      "Both routes, because the router load-balances between protocols",
      "The route with the lowest metric, regardless of protocol"
    ],
    answer: [1],
    explanation:
      "EIGRP internal routes have AD 90, but EIGRP external routes have AD 170. OSPF has AD 110, so the OSPF route wins. Metrics are only compared between routes from the same routing source."
  },
  {
    id: "ad-2",
    domain: "Layer 3 Technologies",
    topic: "Administrative Distance",
    question:
      "An engineer wants a static default route via 198.51.100.1 to be used only if the eBGP-learned default route is lost. Which command accomplishes this?",
    options: [
      "ip route 0.0.0.0 0.0.0.0 198.51.100.1 1",
      "ip route 0.0.0.0 0.0.0.0 198.51.100.1 19",
      "ip route 0.0.0.0 0.0.0.0 198.51.100.1 25",
      "ip route 0.0.0.0 0.0.0.0 198.51.100.1 permanent"
    ],
    answer: [2],
    explanation:
      "eBGP routes have an AD of 20. A floating static route must have a higher AD than the primary source, so any value above 20 (for example 25) makes the static route a backup."
  },
  {
    id: "static-1",
    domain: "Layer 3 Technologies",
    topic: "Static Routing",
    question:
      "Refer to the exhibit. Users report slow performance and the router shows a very large ARP cache with entries for many internet destinations. What is the cause?",
    exhibit:
`R1# show running-config | include ip route
ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/1

R1# show ip arp | count Internet
Number of lines which match regexp = 4182`,
    options: [
      "The default route points to a multiaccess interface without a next hop, so R1 ARPs for every destination and relies on proxy ARP",
      "The default route is missing the permanent keyword",
      "The default route has an administrative distance of 0 and overrides connected routes",
      "GigabitEthernet0/1 has ip directed-broadcast enabled"
    ],
    answer: [0],
    explanation:
      "A static route pointing only to an Ethernet interface treats every destination as directly connected. The router sends an ARP request for each destination IP and depends on the upstream router's proxy ARP. Specify the next-hop IP address instead."
  },
  {
    id: "eigrp-1",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "Refer to the exhibit. R1 and R2 do not form an EIGRP adjacency. Which action resolves the problem?",
    exhibit:
`R1# show running-config | section router eigrp
router eigrp 100
 network 10.1.12.0 0.0.0.255

R2# show running-config | section router eigrp
router eigrp 100
 metric weights 0 1 1 1 0 0
 network 10.1.12.0 0.0.0.255

R1#
%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.1.12.2 (GigabitEthernet0/0) is down: K-value mismatch`,
    options: [
      "Change the autonomous system number on R2",
      "Configure the same metric weights on both routers",
      "Configure matching hello and hold timers on both routers",
      "Add the passive-interface default command on R1"
    ],
    answer: [1],
    explanation:
      "EIGRP neighbors must use the same K values. The default is K1=1, K2=0, K3=1, K4=0, K5=0; R2 also enables K2 (load), so the adjacency fails. Hello and hold timers do not need to match."
  },
  {
    id: "eigrp-2",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "Which three parameters must match for two routers to form an EIGRP neighbor relationship? (Choose three.)",
    options: [
      "Autonomous system number",
      "K values",
      "Hello timer",
      "Authentication parameters",
      "Router ID",
      "Hold timer"
    ],
    answer: [0, 1, 3],
    explanation:
      "The AS number, K values and authentication must match (and the interfaces must share a primary subnet). Hello and hold timers can differ. Router IDs should be unique, not matching."
  },
  {
    id: "eigrp-3",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "Refer to the exhibit. Which statement about the 10.50.0.0/24 prefix is true?",
    exhibit:
`R1# show ip eigrp topology 10.50.0.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 10.50.0.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 3072
  Descriptor Blocks:
  10.1.12.2 (GigabitEthernet0/0), from 10.1.12.2, Send flag is 0x0
      Composite metric is (3072/2816), route is Internal
  10.1.13.3 (GigabitEthernet0/1), from 10.1.13.3, Send flag is 0x0
      Composite metric is (5376/2560), route is Internal
  10.1.14.4 (GigabitEthernet0/2), from 10.1.14.4, Send flag is 0x0
      Composite metric is (4096/3328), route is Internal`,
    options: [
      "Both 10.1.13.3 and 10.1.14.4 are feasible successors",
      "Only 10.1.13.3 is a feasible successor",
      "Only 10.1.14.4 is a feasible successor",
      "There are no feasible successors"
    ],
    answer: [1],
    explanation:
      "Feasibility condition: a neighbor's reported distance must be lower than the current feasible distance (3072). 10.1.13.3 reports 2560 (< 3072), so it is a feasible successor. 10.1.14.4 reports 3328 (> 3072), so it is not, even though its total metric is lower than 10.1.13.3's."
  },
  {
    id: "eigrp-4",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "By default, which two route types does a router configured with the eigrp stub command advertise? (Choose two.)",
    options: ["Connected", "Static", "Summary", "Redistributed", "Learned EIGRP routes"],
    answer: [0, 2],
    explanation:
      "eigrp stub with no keywords is equivalent to eigrp stub connected summary. Static and redistributed routes must be added explicitly."
  },
  {
    id: "eigrp-5",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "A router has a successor with an FD of 2816 and a feasible successor with an FD of 5000. Which command enables load balancing over both paths?",
    options: ["maximum-paths 2", "variance 2", "traffic-share min across-interfaces", "metric weights 0 2 0 1 0 0"],
    answer: [1],
    explanation:
      "variance 2 lets EIGRP install feasible successors with a metric up to 2 × 2816 = 5632. 5000 is within that range, so both paths are used. maximum-paths only controls how many equal (or variance-allowed) paths are installed."
  },
  {
    id: "eigrp-6",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "An engineer configures EIGRP for IPv6 on a router that has only IPv6 addresses. The EIGRP process does not start. What is the cause?",
    exhibit:
`R1(config)# ipv6 router eigrp 10
R1(config-rtr)# exit
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ipv6 eigrp 10

R1# show ipv6 eigrp neighbors
EIGRP-IPv6 Neighbors for AS(10)
% EIGRP 10 is in SHUTDOWN`,
    options: [
      "IPv6 EIGRP requires the network command",
      "The process has no router ID because no IPv4 address exists",
      "IPv6 EIGRP requires a link-local address to be configured manually",
      "ipv6 cef is disabled"
    ],
    answer: [1],
    explanation:
      "EIGRP for IPv6 still uses a 32-bit router ID. With no IPv4 address on the router, configure eigrp router-id manually. (On older IOS releases the process was also shut down by default and needed no shutdown.)"
  },
  {
    id: "eigrp-7",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "After ip summary-address eigrp 100 10.1.0.0 255.255.252.0 is configured on an interface, a route to Null0 appears in the routing table. What is the administrative distance of this route?",
    options: ["0", "1", "5", "90"],
    answer: [2],
    explanation:
      "EIGRP creates a summary discard route to Null0 with an AD of 5 to prevent routing loops for parts of the summary that do not exist."
  },
  {
    id: "ospf-1",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Refer to the exhibit. The OSPF adjacency between R1 and R2 does not reach FULL. What is the most likely cause?",
    exhibit:
`R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   EXSTART/DR      00:00:36    10.1.12.2       GigabitEthernet0/0

R1# show interface GigabitEthernet0/0 | include MTU
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
R2# show interface GigabitEthernet0/0 | include MTU
  MTU 1400 bytes, BW 1000000 Kbit/sec, DLY 10 usec,`,
    options: [
      "Mismatched area IDs",
      "Mismatched interface MTU",
      "Duplicate router IDs",
      "Mismatched authentication keys"
    ],
    answer: [1],
    explanation:
      "Neighbors stuck in EXSTART/EXCHANGE usually point to an MTU mismatch, because the DBD packets from the router with the larger MTU are dropped. Match the MTU, or use ip ospf mtu-ignore as a workaround."
  },
  {
    id: "ospf-2",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Refer to the exhibit. R3 and R4 are on the same Ethernet segment as the DR (R1) and BDR (R2). What does the R3 output indicate?",
    exhibit:
`R3# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           1   FULL/DR         00:00:33    10.0.0.1        GigabitEthernet0/0
2.2.2.2           1   FULL/BDR        00:00:38    10.0.0.2        GigabitEthernet0/0
4.4.4.4           1   2WAY/DROTHER    00:00:31    10.0.0.4        GigabitEthernet0/0`,
    options: [
      "R3 and R4 have mismatched hello timers",
      "R3 and R4 have an MTU mismatch",
      "This is normal; DROTHERs only become FULL with the DR and BDR",
      "R4 has OSPF priority 0 and cannot form adjacencies"
    ],
    answer: [2],
    explanation:
      "On broadcast networks, DROTHER routers form FULL adjacencies only with the DR and BDR. Between DROTHERs, 2WAY is the expected final state."
  },
  {
    id: "ospf-3",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Refer to the exhibit. Which action allows R1 and R2 to form an OSPF adjacency?",
    exhibit:
`R1# debug ip ospf hello
OSPF-1 HELLO Gi0/0: Rcv hello from 2.2.2.2 area 0 10.1.12.2
OSPF-1 HELLO Gi0/0: Mismatched hello parameters from 10.1.12.2
OSPF-1 HELLO Gi0/0: Dead R 120 C 40, Hello R 30 C 10 Mask R 255.255.255.0 C 255.255.255.0`,
    options: [
      "Configure ip ospf network broadcast on R2 Gi0/0, or point-to-multipoint on R1 Gi0/0",
      "Configure the same OSPF process ID on both routers",
      "Change the subnet mask on R2",
      "Configure area 0 authentication on R1"
    ],
    answer: [0],
    explanation:
      "R = received (R2), C = configured (R1). R2 uses 30/120 timers, the default for point-to-multipoint (and NBMA); R1 uses 10/40, the default for broadcast. Matching the network types, or setting the timers manually, fixes the problem. The OSPF process ID is locally significant."
  },
  {
    id: "ospf-4",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Which two LSA types are NOT allowed in an OSPF stub area? (Choose two.)",
    options: ["Type 1", "Type 2", "Type 3", "Type 4", "Type 5"],
    answer: [3, 4],
    explanation:
      "Stub areas block Type 5 (external) LSAs, and therefore also Type 4 (ASBR summary) LSAs. The ABR injects a default route as a Type 3 LSA."
  },
  {
    id: "ospf-5",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Area 2 is connected to area 1 but not to area 0. Area 1 is configured as a stub area. An engineer configures a virtual link through area 1 to connect area 2, but it does not come up. What is the reason?",
    options: [
      "Virtual links require IPsec authentication",
      "A virtual link cannot transit a stub area",
      "The virtual link must be configured with the neighbor's interface IP, not its router ID",
      "Virtual links are supported only in OSPFv3"
    ],
    answer: [1],
    explanation:
      "The transit area of a virtual link must be a regular area. It cannot be a stub, totally stubby, or NSSA. Virtual links are configured with the remote ABR's router ID."
  },
  {
    id: "ospf-6",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Refer to the exhibit. show ip ospf neighbor on R1 lists R2 in the FULL state, but R1 does not install routes learned from R2. What is the cause?",
    exhibit:
`R1# show ip ospf interface Gi0/0 | include Network Type
  Process ID 1, Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1
R2# show ip ospf interface Gi0/0 | include Network Type
  Process ID 1, Router ID 2.2.2.2, Network Type POINT_TO_POINT, Cost: 1

`,
    options: [
      "Mismatched OSPF network types",
      "Mismatched hello timers",
      "Duplicate router IDs",
      "R2 has OSPF priority 0"
    ],
    answer: [0],
    explanation:
      "Broadcast and point-to-point both use 10/40 timers, so the adjacency forms. However, the routers describe the link differently in their Type 1/Type 2 LSAs, so the SPF two-way connectivity check fails and routes are not installed. Configure the same network type on both sides."
  },
  {
    id: "ospf-7",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "An engineer applies distribute-list prefix BLOCK in under router ospf 1 on R2. Which statement about the filtered prefix is true?",
    options: [
      "It is removed from the OSPF LSDB on R2 and from all downstream routers",
      "It is removed from R2's routing table, but remains in R2's LSDB and is still flooded to neighbors",
      "It is removed from R2's LSDB but stays in R2's routing table",
      "It is blocked only if R2 is an ABR"
    ],
    answer: [1],
    explanation:
      "Because OSPF is a link-state protocol, an inbound distribute-list only stops the route from being installed in the local RIB. LSAs are still flooded normally. To filter Type 3 LSAs between areas, use area x filter-list on an ABR."
  },
  {
    id: "ospf-8",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Which command summarizes external routes that are redistributed into OSPF on an ASBR?",
    options: [
      "area 0 range 172.16.0.0 255.255.0.0",
      "summary-address 172.16.0.0 255.255.0.0",
      "ip summary-address ospf 1 172.16.0.0 255.255.0.0",
      "aggregate-address 172.16.0.0 255.255.0.0"
    ],
    answer: [1],
    explanation:
      "summary-address under router ospf summarizes external (Type 5/7) routes on an ASBR. area range summarizes inter-area routes on an ABR."
  },
  {
    id: "bgp-1",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "Refer to the exhibit. The iBGP session between R1 and R2 stays in Active state. Both loopbacks are reachable through OSPF. Which command on R1 fixes the problem (assuming R2 is already configured correctly)?",
    exhibit:
`R1# show running-config | section router bgp
router bgp 65001
 neighbor 2.2.2.2 remote-as 65001

R1# show ip bgp summary | begin Neighbor
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
2.2.2.2         4 65001       0       0        1    0    0 never    Active`,
    options: [
      "neighbor 2.2.2.2 ebgp-multihop 2",
      "neighbor 2.2.2.2 update-source Loopback0",
      "neighbor 2.2.2.2 next-hop-self",
      "neighbor 2.2.2.2 route-reflector-client"
    ],
    answer: [1],
    explanation:
      "R1 sources the TCP session from its outgoing physical interface, but R2 expects the session to come from R1's loopback. Use update-source Loopback0. ebgp-multihop applies only to eBGP."
  },
  {
    id: "bgp-2",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "On a Cisco router, which BGP path attribute is evaluated first in the best-path selection process?",
    options: ["Local preference", "AS_PATH length", "Weight", "MED"],
    answer: [2],
    explanation:
      "Order: Weight (highest, Cisco-proprietary) → Local Preference (highest) → locally originated → AS_PATH (shortest) → Origin (IGP < EGP < incomplete) → MED (lowest) → eBGP over iBGP → lowest IGP metric to next hop → ..."
  },
  {
    id: "bgp-3",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "Refer to the exhibit. R2 is an iBGP peer of R1. R1 learns 192.0.2.0/24 from eBGP peer 203.0.113.1. R2 has the route in its BGP table but does not install it. Which action resolves the issue?",
    exhibit:
`R2# show ip bgp 192.0.2.0
BGP routing table entry for 192.0.2.0/24, version 0
Paths: (1 available, no best path)
  Not advertised to any peer
  65100
    203.0.113.1 (inaccessible) from 1.1.1.1 (1.1.1.1)
      Origin IGP, metric 0, localpref 100, valid, internal`,
    options: [
      "Configure neighbor 2.2.2.2 next-hop-self on R1",
      "Configure neighbor 1.1.1.1 weight 100 on R2",
      "Configure bgp always-compare-med on R2",
      "Configure neighbor 1.1.1.1 soft-reconfiguration inbound on R2"
    ],
    answer: [0],
    explanation:
      "iBGP does not change the eBGP next hop. R2 has no route to 203.0.113.1, so the path is inaccessible. next-hop-self on R1 (or advertising the external link into the IGP) solves the problem."
  },
  {
    id: "bgp-4",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "R1, R2 and R3 are in AS 65001. R1 peers with R2, and R2 peers with R3 (iBGP only, no full mesh). Routes learned by R1 from an eBGP peer do not reach R3. Which two solutions fix this? (Choose two.)",
    options: [
      "Configure a full mesh of iBGP sessions",
      "Configure R2 as a route reflector with R1 and R3 as clients",
      "Configure next-hop-self on R2",
      "Configure ebgp-multihop on R2",
      "Configure the allowas-in feature on R3"
    ],
    answer: [0, 1],
    explanation:
      "The iBGP split-horizon rule prevents R2 from advertising iBGP-learned routes to another iBGP peer. Fix this with a full mesh, a route reflector, or confederations."
  },
  {
    id: "bgp-5",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "An enterprise has two links to the same ISP and wants to influence how traffic ENTERS its autonomous system. Which two attributes can it use? (Choose two.)",
    options: ["Weight", "Local preference", "AS_PATH prepending", "MED", "Administrative distance"],
    answer: [2, 3],
    explanation:
      "Inbound traffic is influenced by what you advertise to the neighbor: a prepended AS_PATH or MED (MED is compared only for paths from the same neighbor AS). Weight and local preference influence outbound traffic."
  },
  {
    id: "bgp-6",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "Refer to the exhibit. 10.0.0.0/8 is not advertised to the eBGP peer. What is the reason?",
    exhibit:
`R1# show running-config | section router bgp
router bgp 65001
 network 10.0.0.0 mask 255.0.0.0
 neighbor 203.0.113.2 remote-as 65002

R1# show ip route 10.0.0.0 255.0.0.0 longer-prefixes | begin Gateway
Gateway of last resort is not set
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
O        10.1.0.0/16 [110/2] via 10.255.0.2, Gi0/1
O        10.2.0.0/16 [110/2] via 10.255.0.2, Gi0/1
C        10.255.0.0/30 is directly connected, Gi0/1`,
    options: [
      "The BGP network command requires an exact match for the prefix in the routing table",
      "Auto-summary is disabled",
      "OSPF routes cannot be advertised into BGP",
      "The eBGP neighbor is missing ebgp-multihop"
    ],
    answer: [0],
    explanation:
      "The network command advertises a prefix only if an exact match (prefix and mask) exists in the RIB. Add ip route 10.0.0.0 255.0.0.0 Null0, or use aggregate-address."
  },
  {
    id: "bgp-7",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "Refer to the exhibit. What is the state of the BGP session with 192.0.2.2?",
    exhibit:
`R1# show ip bgp summary | begin Neighbor
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
192.0.2.2       4 65010     112     118        0    0    0 00:02:11 Idle (Admin)`,
    options: [
      "The neighbor sent a NOTIFICATION because of a hold-time mismatch",
      "The session was administratively shut down with the neighbor shutdown command",
      "The maximum-prefix limit was exceeded",
      "TCP port 179 is blocked"
    ],
    answer: [1],
    explanation:
      "Idle (Admin) means neighbor x.x.x.x shutdown is configured. A maximum-prefix shutdown shows Idle (PfxCt)."
  },
  {
    id: "bgp-8",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "R1 redistributes BGP into OSPF. Only routes learned from eBGP peers appear in OSPF; routes learned from iBGP peers do not. Which command changes this behavior?",
    options: [
      "redistribute bgp 65001 subnets internal",
      "bgp redistribute-internal",
      "neighbor x.x.x.x send-community",
      "default-information originate always"
    ],
    answer: [1],
    explanation:
      "To prevent routing loops, IOS does not redistribute iBGP-learned routes into an IGP by default. Use bgp redistribute-internal under the BGP process to allow it (with care)."
  },
  {
    id: "bgp-9",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "Two eBGP peers use loopback interfaces as session sources. The loopbacks are reachable through static routes. Which two additional commands are required? (Choose two.)",
    options: [
      "neighbor x.x.x.x update-source Loopback0",
      "neighbor x.x.x.x ebgp-multihop 2",
      "neighbor x.x.x.x next-hop-self",
      "neighbor x.x.x.x route-reflector-client",
      "bgp always-compare-med"
    ],
    answer: [0, 1],
    explanation:
      "update-source sets the TCP source to the loopback. eBGP packets are sent with TTL 1 by default, so ebgp-multihop 2 (or disable-connected-check for directly connected peers) is needed to reach a loopback one hop beyond the link."
  },
  {
    id: "redist-1",
    domain: "Layer 3 Technologies",
    topic: "Route Redistribution",
    question:
      "Refer to the exhibit. OSPF routes are not appearing in the EIGRP topology on R1. What is the cause?",
    exhibit:
`R1# show running-config | section router
router eigrp 100
 network 10.1.0.0 0.0.255.255
 redistribute ospf 1
router ospf 1
 network 172.16.0.0 0.0.255.255 area 0`,
    options: [
      "OSPF has a higher administrative distance than EIGRP",
      "No seed metric was specified for the redistributed routes",
      "The subnets keyword is missing",
      "EIGRP requires a route-map for redistribution"
    ],
    answer: [1],
    explanation:
      "EIGRP's default seed metric for routes redistributed from another routing protocol is infinity, so they are not used. Specify a metric with redistribute ospf 1 metric 10000 100 255 1 1500 or with default-metric."
  },
  {
    id: "redist-2",
    domain: "Layer 3 Technologies",
    topic: "Route Redistribution",
    question:
      "What is the default seed metric for EIGRP routes redistributed into OSPF on Cisco IOS?",
    options: ["1", "10", "20", "Infinity"],
    answer: [2],
    explanation:
      "Routes redistributed into OSPF get a metric of 20 and type E2 by default. The exception is BGP, which gets a metric of 1."
  },
  {
    id: "redist-3",
    domain: "Layer 3 Technologies",
    topic: "Route Redistribution",
    question:
      "Two routers perform mutual redistribution between OSPF and EIGRP. Routes are being fed back into their source protocol, causing suboptimal routing. Which solution prevents this?",
    options: [
      "Enable split horizon on both routers",
      "Tag routes during redistribution and use route-maps to deny routes carrying the tag of the other protocol",
      "Increase the OSPF reference bandwidth",
      "Configure EIGRP as a stub on both routers"
    ],
    answer: [1],
    explanation:
      "Setting a tag when routes enter a protocol and denying routes with that tag when redistributing back is the standard way to stop feedback loops at multiple redistribution points. Changing the AD is another option."
  },
  {
    id: "filter-1",
    domain: "Layer 3 Technologies",
    topic: "Route Filtering",
    question:
      "Refer to the exhibit. Which two prefixes are permitted by the prefix list? (Choose two.)",
    exhibit: `ip prefix-list TEST seq 5 permit 10.0.0.0/8 ge 16 le 24`,
    options: ["10.0.0.0/8", "10.1.0.0/16", "10.1.1.0/24", "10.1.1.128/25", "11.1.0.0/16"],
    answer: [1, 2],
    explanation:
      "The first 8 bits must match 10, and the prefix length must be from /16 to /24. 10.0.0.0/8 is too short, /25 is too long, and 11.1.0.0/16 does not match the first 8 bits."
  },
  {
    id: "filter-2",
    domain: "Layer 3 Technologies",
    topic: "Route Filtering",
    question:
      "Refer to the exhibit. The route-map is applied to a redistribution statement. Which routes are redistributed?",
    exhibit:
`ip prefix-list LAB seq 5 permit 192.168.10.0/24
!
route-map FILTER deny 10
 match ip address prefix-list LAB`,
    options: [
      "All routes except 192.168.10.0/24",
      "Only 192.168.10.0/24",
      "No routes",
      "All routes, because deny route-map entries are ignored during redistribution"
    ],
    answer: [2],
    explanation:
      "192.168.10.0/24 matches sequence 10 and is denied. All other routes reach the implicit deny at the end of the route-map, so nothing is redistributed. Add an empty route-map FILTER permit 20 to allow the rest."
  },
  {
    id: "pbr-1",
    domain: "Layer 3 Technologies",
    topic: "Policy-Based Routing",
    question:
      "Refer to the exhibit. Traffic from users on Gi0/0 is policy-routed correctly, but pings sourced from R1 itself to 10.99.0.0/16 follow the routing table. Which command fixes this?",
    exhibit:
`access-list 110 permit ip any 10.99.0.0 0.0.255.255
route-map PBR permit 10
 match ip address 110
 set ip next-hop 10.2.2.2
!
interface GigabitEthernet0/0
 ip policy route-map PBR`,
    options: [
      "ip policy route-map PBR on the outgoing interface",
      "ip local policy route-map PBR in global configuration",
      "set ip default next-hop 10.2.2.2 in the route-map",
      "ip route-cache policy on Gi0/0"
    ],
    answer: [1],
    explanation:
      "ip policy route-map applies only to packets arriving on that interface. Router-generated traffic needs ip local policy route-map."
  },
  {
    id: "pbr-2",
    domain: "Layer 3 Technologies",
    topic: "Policy-Based Routing",
    question:
      "A route-map used for PBR contains set ip next-hop 10.2.2.2. What happens to matching packets when 10.2.2.2 is not reachable?",
    options: [
      "The packets are dropped",
      "The packets are forwarded using the normal routing table",
      "The packets are sent to Null0",
      "The packets are flooded on all interfaces"
    ],
    answer: [1],
    explanation:
      "If the set next hop is not a reachable adjacent neighbor, PBR falls back to normal destination-based routing. Use set ip next-hop verify-availability with object tracking for more precise failover."
  },
  {
    id: "vrf-1",
    domain: "Layer 3 Technologies",
    topic: "VRF-Lite",
    question:
      "An engineer runs vrf forwarding CUST-A on an interface that already has an IPv4 address. What happens?",
    options: [
      "The interface keeps its IP address and joins the VRF",
      "The IP address is removed and must be configured again",
      "The command is rejected until the interface is shut down",
      "The IP address is moved to a subinterface automatically"
    ],
    answer: [1],
    explanation:
      "Assigning an interface to a VRF removes its existing IP address, as IOS reports with a message (\"% Interface ... IPv4 disabled and address(es) removed\"). The address must be configured again."
  },
  {
    id: "vrf-2",
    domain: "Layer 3 Technologies",
    topic: "VRF-Lite",
    question:
      "Refer to the exhibit. Why does the ping fail even though the route exists?",
    exhibit:
`R1# show ip route vrf CUST-A 10.50.1.0
Routing Table: CUST-A
Routing entry for 10.50.1.0/24
  Known via "ospf 10", distance 110, metric 2, type intra area

R1# ping 10.50.1.1
.....
Success rate is 0 percent (0/5)`,
    options: [
      "OSPF routes in a VRF cannot be used for pings",
      "The ping uses the global routing table; use ping vrf CUST-A 10.50.1.1",
      "The VRF requires an RD before it forwards traffic",
      "ip cef must be disabled for VRF-lite"
    ],
    answer: [1],
    explanation:
      "Router-generated pings use the global table unless a VRF is given. Use ping vrf CUST-A 10.50.1.1. An RD is only needed for MP-BGP/MPLS VPNs, not for VRF-lite."
  },
  {
    id: "bfd-1",
    domain: "Layer 3 Technologies",
    topic: "BFD",
    question:
      "Which command enables BFD fast failure detection for an eBGP neighbor?",
    options: [
      "neighbor 10.1.1.2 bfd interval 50",
      "neighbor 10.1.1.2 fall-over bfd",
      "bfd all-interfaces",
      "neighbor 10.1.1.2 timers 1 3"
    ],
    answer: [1],
    explanation:
      "BGP registers with BFD per neighbor using neighbor x fall-over bfd. The interface also needs bfd interval x min_rx y multiplier z. bfd all-interfaces is used under OSPF/EIGRP/IS-IS."
  },
  {
    id: "bfd-2",
    domain: "Layer 3 Technologies",
    topic: "BFD",
    question:
      "Which two statements about BFD are true? (Choose two.)",
    options: [
      "BFD replaces the routing protocol's hello mechanism entirely",
      "BFD must be enabled on the interface and registered by the routing protocol",
      "BFD provides sub-second failure detection independent of the routing protocol",
      "BFD works only with OSPF",
      "BFD requires the same AS number on both peers"
    ],
    answer: [1, 2],
    explanation:
      "BFD is a lightweight, protocol-independent liveness check. Clients such as OSPF, EIGRP, BGP and static routes register with it. Routing protocol hellos still run."
  },
  {
    id: "ipv6-1",
    domain: "Layer 3 Technologies",
    topic: "IPv6 Routing",
    question:
      "An engineer enables OSPFv3 on an interface with ospfv3 1 ipv6 area 0, but the command fails. Which global command is most likely missing?",
    options: ["ipv6 cef", "ipv6 unicast-routing", "ipv6 enable", "ipv6 nd ra suppress"],
    answer: [1],
    explanation:
      "IPv6 routing protocols cannot start until IPv6 routing is enabled globally with ipv6 unicast-routing."
  },

  // ───────────────────────── VPN Technologies ─────────────────────────
  {
    id: "mpls-1",
    domain: "VPN Technologies",
    topic: "MPLS",
    question:
      "Which two statements about LDP are true? (Choose two.)",
    options: [
      "LDP discovers neighbors with hellos sent to 224.0.0.2 on UDP port 646",
      "LDP sessions are established over TCP port 646",
      "LDP sessions are established over TCP port 179",
      "LDP discovers neighbors with hellos sent to 224.0.0.5",
      "LDP requires the neighbors to share an OSPF area"
    ],
    answer: [0, 1],
    explanation:
      "Basic LDP discovery uses UDP 646 to the all-routers multicast address 224.0.0.2. The session itself uses TCP 646, sourced from the transport address (by default the LDP router ID)."
  },
  {
    id: "mpls-2",
    domain: "VPN Technologies",
    topic: "MPLS",
    question:
      "Refer to the exhibit. The LDP session between R1 and R2 does not come up, although LDP hellos are exchanged. What is the cause?",
    exhibit:
`R1# show mpls ldp discovery
 Local LDP Identifier:
    1.1.1.1:0
    Discovery Sources:
    Interfaces:
        GigabitEthernet0/0 (ldp): xmit/recv
            LDP Id: 2.2.2.2:0; no host route to transport addr

R1# show ip route 2.2.2.2
% Network not in table`,
    options: [
      "The LDP router ID of R2 is not reachable from R1; R2 must advertise its loopback in the IGP",
      "MPLS is not enabled on R1 Gi0/0",
      "The LDP label range does not match",
      "R1 and R2 use different LDP password encryption"
    ],
    answer: [0],
    explanation:
      "The TCP session is set up toward the transport address (R2's router ID 2.2.2.2). R1 has no route to it. Advertise the loopback in the IGP, or change the transport address."
  },
  {
    id: "mpls-3",
    domain: "VPN Technologies",
    topic: "MPLS",
    question:
      "Which label value does an egress LSR advertise to signal penultimate hop popping (PHP)?",
    options: ["0 (explicit null)", "1 (router alert)", "3 (implicit null)", "16"],
    answer: [2],
    explanation:
      "Implicit null (label 3) tells the upstream LSR to pop the top label before forwarding. Explicit null (0) keeps a label so QoS EXP bits are preserved to the egress."
  },
  {
    id: "mpls-4",
    domain: "VPN Technologies",
    topic: "MPLS",
    question:
      "Which two statements about MPLS Layer 3 VPN are true? (Choose two.)",
    options: [
      "The route distinguisher makes overlapping customer prefixes unique in MP-BGP",
      "Route targets control which VRFs import and export VPNv4 routes",
      "The route distinguisher controls route import into a VRF",
      "Customer routers must run LDP with the PE",
      "Route targets are carried in the IP header"
    ],
    answer: [0, 1],
    explanation:
      "The RD is prepended to the IPv4 prefix to create a unique VPNv4 prefix. Route targets are extended BGP communities used for import/export policy. CE routers do not need MPLS."
  },
  {
    id: "mpls-5",
    domain: "VPN Technologies",
    topic: "MPLS",
    question:
      "Two customer sites both use BGP AS 65010 and connect to an MPLS L3VPN provider. Routes from one site are not accepted at the other site. Which PE command resolves this without CE changes?",
    options: [
      "neighbor x.x.x.x allowas-in",
      "neighbor x.x.x.x as-override",
      "neighbor x.x.x.x remove-private-as",
      "neighbor x.x.x.x next-hop-self"
    ],
    answer: [1],
    explanation:
      "The CE rejects routes that contain its own AS in the AS_PATH (loop prevention). as-override on the PE replaces the customer AS with the provider AS. allowas-in would have to be configured on the CE."
  },
  {
    id: "mpls-6",
    domain: "VPN Technologies",
    topic: "MPLS",
    question: "Which table does an LSR use to forward packets that are already labeled?",
    options: ["RIB", "FIB", "LFIB", "LIB"],
    answer: [2],
    explanation:
      "The LFIB (Label Forwarding Information Base) maps incoming labels to outgoing labels and interfaces. The LIB stores all labels learned from neighbors, and the FIB is used to impose labels on unlabeled IP packets."
  },
  {
    id: "dmvpn-1",
    domain: "VPN Technologies",
    topic: "DMVPN",
    question:
      "Which two commands enable DMVPN Phase 3 spoke-to-spoke shortcut routing? (Choose two.)",
    options: [
      "ip nhrp redirect on the hub tunnel interface",
      "ip nhrp shortcut on the spoke tunnel interfaces",
      "ip nhrp map multicast dynamic on the spokes",
      "tunnel mode gre ip on the hub",
      "no ip split-horizon on the spokes"
    ],
    answer: [0, 1],
    explanation:
      "In Phase 3, the hub sends NHRP redirect messages (ip nhrp redirect), and spokes install NHRP shortcut routes (ip nhrp shortcut). The hub can then advertise summaries or a default route."
  },
  {
    id: "dmvpn-2",
    domain: "VPN Technologies",
    topic: "DMVPN",
    question:
      "Refer to the exhibit. The spoke registers with the hub, but no EIGRP adjacency forms over the tunnel. Which command on the spoke fixes the problem?",
    exhibit:
`Spoke1# show running-config interface Tunnel0
interface Tunnel0
 ip address 172.16.0.11 255.255.255.0
 ip nhrp network-id 1
 ip nhrp nhs 172.16.0.1 nbma 198.51.100.1
 tunnel source GigabitEthernet0/1
 tunnel mode gre multipoint`,
    options: [
      "ip nhrp map multicast 198.51.100.1",
      "ip nhrp redirect",
      "tunnel destination 198.51.100.1",
      "ip nhrp registration no-unique"
    ],
    answer: [0],
    explanation:
      "mGRE interfaces need explicit NHRP multicast mappings to send multicast (EIGRP hellos to 224.0.0.10). On the spoke, map multicast to the hub's NBMA address. Alternatively, add the multicast keyword to the ip nhrp nhs command. The hub uses ip nhrp map multicast dynamic."
  },
  {
    id: "dmvpn-3",
    domain: "VPN Technologies",
    topic: "DMVPN",
    question:
      "A DMVPN Phase 2 network runs EIGRP. Spokes learn each other's networks, but traffic between spokes still goes through the hub. Which two commands on the hub enable direct spoke-to-spoke traffic? (Choose two.)",
    options: [
      "no ip split-horizon eigrp 100",
      "no ip next-hop-self eigrp 100",
      "ip nhrp shortcut",
      "eigrp stub",
      "ip summary-address eigrp 100 0.0.0.0 0.0.0.0"
    ],
    answer: [0, 1],
    explanation:
      "In Phase 2, the hub must re-advertise spoke routes back out the same tunnel (disable split horizon) and keep the originating spoke as the next hop (no next-hop-self). Spokes then trigger NHRP resolution for direct tunnels."
  },
  {
    id: "dmvpn-4",
    domain: "VPN Technologies",
    topic: "DMVPN",
    question:
      "OSPF runs over DMVPN with the broadcast network type. Which configuration ensures that the hub is always the DR?",
    options: [
      "ip ospf priority 255 on the hub only",
      "ip ospf priority 0 on all spoke tunnel interfaces",
      "ip ospf network point-to-point on the hub",
      "ip ospf cost 1 on the hub"
    ],
    answer: [1],
    explanation:
      "Spokes do not have adjacencies with each other, so a spoke must never become DR/BDR. Priority 0 on the spokes guarantees it. A high priority on the hub alone does not prevent a spoke from winning when the hub reloads."
  },
  {
    id: "dmvpn-5",
    domain: "VPN Technologies",
    topic: "DMVPN",
    question: "Which protocol does DMVPN use to map a tunnel IP address to a spoke's public (NBMA) address?",
    options: ["ARP", "NHRP", "IKEv2", "LDP"],
    answer: [1],
    explanation:
      "NHRP (Next Hop Resolution Protocol) performs tunnel-to-NBMA address resolution. Spokes register their mappings with the NHS (hub)."
  },
  {
    id: "ipsec-1",
    domain: "VPN Technologies",
    topic: "IPsec",
    question:
      "Refer to the exhibit. An IKEv1 site-to-site tunnel does not come up. What is the cause?",
    exhibit:
`R1# debug crypto isakmp
ISAKMP:(0):Checking ISAKMP transform 1 against priority 10 policy
ISAKMP:      encryption AES-CBC
ISAKMP:      keylength of 256
ISAKMP:      hash SHA256
ISAKMP:      default group 14
ISAKMP:      auth pre-share
ISAKMP:(0):Encryption algorithm offered does not match policy!
ISAKMP:(0):atts are not acceptable. Next payload is 0
ISAKMP:(0):no offers accepted!`,
    options: [
      "The pre-shared keys do not match",
      "The ISAKMP (phase 1) policies do not match",
      "The IPsec transform sets do not match",
      "The crypto ACLs are not mirror images"
    ],
    answer: [1],
    explanation:
      "'atts are not acceptable' and 'no offers accepted' during ISAKMP policy checking mean the phase 1 policies (encryption, hash, authentication, DH group) do not match. A PSK mismatch shows up later as a hash/MM_KEY_EXCH problem."
  },
  {
    id: "ipsec-2",
    domain: "VPN Technologies",
    topic: "IPsec",
    question:
      "IPsec peers are behind a NAT device. Which two ports must be permitted through the firewall for the tunnel to work? (Choose two.)",
    options: ["UDP 500", "UDP 4500", "TCP 50", "UDP 1701", "TCP 443"],
    answer: [0, 1],
    explanation:
      "IKE uses UDP 500. When NAT is detected, the peers switch to NAT-Traversal, which carries IKE and ESP over UDP 4500. ESP itself is IP protocol 50, not TCP port 50."
  },
  {
    id: "ipsec-3",
    domain: "VPN Technologies",
    topic: "IPsec",
    question: "Which command applies IPsec protection to a DMVPN mGRE tunnel interface?",
    options: [
      "crypto map VPN",
      "tunnel protection ipsec profile DMVPN-PROF",
      "ip ipsec enable",
      "tunnel mode ipsec ipv4"
    ],
    answer: [1],
    explanation:
      "DMVPN uses an IPsec profile applied with tunnel protection ipsec profile. Crypto maps are used for traditional policy-based site-to-site VPNs."
  },
  {
    id: "ipsec-4",
    domain: "VPN Technologies",
    topic: "IPsec",
    question: "Why is IPsec transport mode commonly used with GRE or DMVPN tunnels?",
    options: [
      "Transport mode is the only mode supporting AES",
      "GRE already adds a new outer IP header, so tunnel mode would add an unnecessary extra header",
      "Transport mode encrypts the original IP header",
      "Tunnel mode does not work with NHRP"
    ],
    answer: [1],
    explanation:
      "The GRE packet already has an outer IP header with the tunnel endpoints. Transport mode protects the GRE payload without adding another 20-byte IP header, which saves overhead."
  },

  // ───────────────────────── Infrastructure Security ─────────────────────────
  {
    id: "aaa-1",
    domain: "Infrastructure Security",
    topic: "AAA",
    question:
      "Refer to the exhibit. The TACACS+ server is reachable and rejects a user's credentials. What happens?",
    exhibit:
`aaa new-model
aaa authentication login default group tacacs+ local`,
    options: [
      "The router tries the local user database next",
      "Access is denied",
      "The user is logged in with privilege level 1",
      "The router tries the enable password next"
    ],
    answer: [1],
    explanation:
      "The next method in the list is tried only when the current method returns an ERROR (for example, the server is unreachable). A FAIL response (reject) from the server ends authentication and denies access."
  },
  {
    id: "aaa-2",
    domain: "Infrastructure Security",
    topic: "AAA",
    question: "Which two statements describe TACACS+? (Choose two.)",
    options: [
      "It uses TCP port 49",
      "It encrypts the entire packet body",
      "It combines authentication and authorization in one process",
      "It uses UDP ports 1812 and 1813",
      "It encrypts only the password"
    ],
    answer: [0, 1],
    explanation:
      "TACACS+ (Cisco) uses TCP 49, encrypts the whole payload, and separates authentication, authorization and accounting, which allows per-command authorization. RADIUS uses UDP 1812/1813, encrypts only the password, and combines authentication with authorization."
  },
  {
    id: "aaa-3",
    domain: "Infrastructure Security",
    topic: "AAA",
    question:
      "Users authenticate through TACACS+ successfully, but always land at privilege level 1, even though the server assigns privilege level 15. Which command is missing?",
    options: [
      "aaa authorization exec default group tacacs+ local",
      "aaa accounting exec default start-stop group tacacs+",
      "aaa authentication enable default group tacacs+",
      "privilege exec level 15 show"
    ],
    answer: [0],
    explanation:
      "Privilege levels and other session attributes are authorization data. Without aaa authorization exec, the router ignores the privilege level the server sends."
  },
  {
    id: "acl-1",
    domain: "Infrastructure Security",
    topic: "ACLs",
    question:
      "Refer to the exhibit. ACL 120 is applied inbound on the LAN interface. Host 192.168.1.50 can still browse web servers. Why?",
    exhibit:
`ip access-list extended 120
 10 permit tcp 192.168.1.0 0.0.0.255 any eq www
 20 deny   tcp host 192.168.1.50 any eq www
 30 permit ip any any`,
    options: [
      "Extended ACLs must be applied outbound",
      "Sequence 10 matches the traffic first, so sequence 20 is never reached",
      "The deny statement must use the eq 443 keyword",
      "Host statements are processed after network statements"
    ],
    answer: [1],
    explanation:
      "ACLs are processed top-down and stop at the first match. Move the host deny above the subnet permit (for example as sequence 5)."
  },
  {
    id: "acl-2",
    domain: "Infrastructure Security",
    topic: "ACLs",
    question: "Which ACE matches exactly the addresses 172.16.16.0 through 172.16.31.255?",
    options: [
      "permit ip 172.16.16.0 0.0.31.255 any",
      "permit ip 172.16.16.0 0.0.15.255 any",
      "permit ip 172.16.0.0 0.0.31.255 any",
      "permit ip 172.16.16.0 0.0.16.255 any"
    ],
    answer: [1],
    explanation:
      "172.16.16.0–172.16.31.255 is 16 × /24 = a /20. The wildcard for a /20 is 0.0.15.255."
  },
  {
    id: "acl-3",
    domain: "Infrastructure Security",
    topic: "ACLs",
    question:
      "Which two entries are implicitly permitted at the end of every IPv6 ACL, before the implicit deny? (Choose two.)",
    options: [
      "permit icmp any any nd-na",
      "permit icmp any any nd-ns",
      "permit icmp any any echo-request",
      "permit udp any any eq 546",
      "permit ipv6 any FF02::/16"
    ],
    answer: [0, 1],
    explanation:
      "IPv6 ACLs implicitly permit Neighbor Advertisements and Neighbor Solicitations so that address resolution keeps working, followed by deny ipv6 any any. An explicit deny ipv6 any any log placed earlier blocks ND."
  },
  {
    id: "urpf-1",
    domain: "Infrastructure Security",
    topic: "uRPF",
    question:
      "An edge router is multihomed to two ISPs with asymmetric routing. Which uRPF configuration provides anti-spoofing without dropping legitimate traffic?",
    options: [
      "ip verify unicast source reachable-via rx",
      "ip verify unicast source reachable-via any",
      "ip verify unicast source reachable-via rx allow-default",
      "ip verify unicast reverse-path"
    ],
    answer: [1],
    explanation:
      "Strict mode (rx) requires the best return path to use the receiving interface, which drops legitimate traffic when routing is asymmetric. Loose mode (any) only requires that the source exists somewhere in the FIB."
  },
  {
    id: "urpf-2",
    domain: "Infrastructure Security",
    topic: "uRPF",
    question:
      "An internet edge router has ip verify unicast source reachable-via any on its ISP-facing interface. Its only route toward the internet is a default route. What happens to inbound packets whose source addresses are not covered by any specific route?",
    options: [
      "They are accepted, because the default route matches every source",
      "They are dropped, because uRPF ignores the default route unless allow-default is configured",
      "They are accepted, because loose mode checks only the destination address",
      "They are dropped only if they arrive on an interface other than the default route's exit interface"
    ],
    answer: [1],
    explanation:
      "By default, uRPF does not treat the default route as a valid match for a source address. Without the allow-default keyword, packets whose source is reachable only through the default route fail the check and are dropped, so on a default-only edge router, loose mode would drop most legitimate internet traffic."
  },
  {
    id: "copp-1",
    domain: "Infrastructure Security",
    topic: "CoPP",
    question: "Which configuration applies a Control Plane Policing policy?",
    options: [
      "interface GigabitEthernet0/0 → service-policy input COPP",
      "control-plane → service-policy input COPP",
      "control-plane → ip access-group COPP in",
      "line vty 0 4 → service-policy input COPP"
    ],
    answer: [1],
    explanation:
      "CoPP uses the MQC: class-maps and a policy-map, attached with service-policy input under control-plane."
  },
  {
    id: "copp-2",
    domain: "Infrastructure Security",
    topic: "CoPP",
    question:
      "A class-map in a CoPP policy matches an ACL. What happens to traffic that matches a deny entry in that ACL?",
    options: [
      "It is dropped by the control plane",
      "It does not match this class and is evaluated against the next class",
      "It is rate-limited to the default rate",
      "It is sent to the data plane"
    ],
    answer: [1],
    explanation:
      "In MQC, the ACL only selects traffic. permit = matches the class; deny = does not match the class. The action (drop, police, transmit) is set in the policy-map."
  },
  {
    id: "fhs-1",
    domain: "Infrastructure Security",
    topic: "IPv6 First Hop Security",
    question:
      "Hosts on a VLAN receive a rogue default gateway from a user's laptop that is sending ICMPv6 Router Advertisements. Which feature prevents this?",
    options: ["DHCPv6 Guard", "RA Guard", "IPv6 Source Guard", "IPv6 Destination Guard"],
    answer: [1],
    explanation:
      "RA Guard blocks Router Advertisements on ports that are not configured as router-facing. DHCPv6 Guard blocks rogue DHCPv6 server replies."
  },
  {
    id: "fhs-2",
    domain: "Infrastructure Security",
    topic: "IPv6 First Hop Security",
    question:
      "Which IPv6 First Hop Security feature builds the binding table that IPv6 Source Guard uses?",
    options: ["RA Guard", "IPv6 Snooping (ND inspection / DHCPv6 snooping)", "uRPF", "Port security"],
    answer: [1],
    explanation:
      "IPv6 snooping learns address-to-MAC-to-port bindings from ND and DHCPv6 traffic. Source Guard and Destination Guard rely on that binding table."
  },
  {
    id: "sec-1",
    domain: "Infrastructure Security",
    topic: "Device Security",
    question:
      "Which three items are required before a Cisco IOS router can accept SSH connections? (Choose three.)",
    options: [
      "A hostname other than the default",
      "An IP domain name",
      "An RSA key pair",
      "An enable password",
      "An NTP server",
      "A TACACS+ server"
    ],
    answer: [0, 1, 2],
    explanation:
      "The RSA key name is derived from the hostname and the domain name, so both must exist before crypto key generate rsa. SSHv2 requires a modulus of at least 768 bits. Lines also need login local (or AAA) and transport input ssh."
  },
  {
    id: "sec-2",
    domain: "Infrastructure Security",
    topic: "Device Security",
    question:
      "Which command blocks login attempts for 120 seconds after three failed logins within 60 seconds?",
    options: [
      "login block-for 120 attempts 3 within 60",
      "login delay 120",
      "security authentication failure rate 3 log",
      "aaa local authentication attempts max-fail 3"
    ],
    answer: [0],
    explanation:
      "login block-for puts the device into quiet mode. login quiet-mode access-class can exempt trusted management hosts."
  },

  // ───────────────────────── Infrastructure Services ─────────────────────────
  {
    id: "syslog-1",
    domain: "Infrastructure Services",
    topic: "Syslog",
    question: "Which severity levels are sent to the syslog server after logging trap warnings is configured?",
    options: ["Level 4 only", "Levels 0 through 4", "Levels 4 through 7", "Levels 0 through 3"],
    answer: [1],
    explanation:
      "Setting a level sends that level and every more severe level (lower number): 0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings."
  },
  {
    id: "syslog-2",
    domain: "Infrastructure Services",
    topic: "Syslog",
    question: "What is the severity level of this message?\n%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down",
    options: ["Errors", "Warnings", "Notifications", "Informational"],
    answer: [2],
    explanation:
      "The number between the facility and mnemonic is the severity. 5 = notifications."
  },
  {
    id: "snmp-1",
    domain: "Infrastructure Services",
    topic: "SNMP",
    question: "Which SNMPv3 security level provides both authentication and encryption?",
    options: ["noAuthNoPriv", "authNoPriv", "authPriv", "authEncrypt"],
    answer: [2],
    explanation:
      "authPriv (configured with the priv keyword) authenticates messages (HMAC-SHA/MD5) and encrypts them (AES/DES)."
  },
  {
    id: "snmp-2",
    domain: "Infrastructure Services",
    topic: "SNMP",
    question: "Which two statements about SNMP are true? (Choose two.)",
    options: [
      "Informs are acknowledged by the manager; traps are not",
      "Agents listen for polling requests on UDP 161",
      "Traps are sent to UDP 161",
      "SNMPv2c encrypts the community string",
      "Traps are retransmitted until acknowledged"
    ],
    answer: [0, 1],
    explanation:
      "Polling (get/set) goes to the agent on UDP 161. Traps and informs go to the manager on UDP 162. Informs are acknowledged and retransmitted; traps are not. SNMPv1/v2c send the community string in clear text."
  },
  {
    id: "dhcp-1",
    domain: "Infrastructure Services",
    topic: "DHCP",
    question:
      "Refer to the exhibit. Clients on VLAN 20 (Gi0/0.20) do not receive IP addresses from the DHCP server at 10.0.0.10. Which action fixes this?",
    exhibit:
`R1# show running-config interface GigabitEthernet0/0.20
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0

R1# show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 description To DHCP server segment
 ip address 10.0.0.1 255.255.255.0
 ip helper-address 10.0.0.10`,
    options: [
      "Move ip helper-address 10.0.0.10 to Gi0/0.20",
      "Configure ip dhcp relay information trust-all on Gi0/1",
      "Configure ip forward-protocol udp 68 on R1",
      "Configure service dhcp on the DHCP server"
    ],
    answer: [0],
    explanation:
      "The relay agent must be configured on the interface that receives the client's broadcast DHCPDISCOVER, which is the client-facing interface Gi0/0.20."
  },
  {
    id: "dhcp-2",
    domain: "Infrastructure Services",
    topic: "DHCP",
    question: "How does a DHCP server select the correct pool for a client request forwarded by a relay agent?",
    options: [
      "By the client's MAC address",
      "By the giaddr field, which the relay sets to the IP address of the interface that received the request",
      "By the source IP address of the client",
      "By the VLAN tag in the frame"
    ],
    answer: [1],
    explanation:
      "The relay sets giaddr to the receiving interface's IP address. The server uses it to pick the pool for that subnet and unicasts the reply back to the relay."
  },
  {
    id: "dhcp-3",
    domain: "Infrastructure Services",
    topic: "DHCP",
    question: "Which interface command tells IPv6 hosts to obtain their addresses from a stateful DHCPv6 server?",
    options: [
      "ipv6 nd other-config-flag",
      "ipv6 nd managed-config-flag",
      "ipv6 dhcp relay destination",
      "ipv6 address autoconfig"
    ],
    answer: [1],
    explanation:
      "The M (managed) flag in RAs tells hosts to use stateful DHCPv6 for addressing. The O (other) flag tells hosts to use SLAAC for the address and DHCPv6 only for other information such as DNS."
  },
  {
    id: "ipsla-1",
    domain: "Infrastructure Services",
    topic: "IP SLA",
    question:
      "Refer to the exhibit. The tracked default route is never installed, and track 1 stays down. What is the cause?",
    exhibit:
`ip sla 1
 icmp-echo 203.0.113.1 source-interface GigabitEthernet0/1
 frequency 5
!
track 1 ip sla 1 reachability
!
ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 10`,
    options: [
      "The track object must use the state keyword instead of reachability",
      "The IP SLA operation is not scheduled",
      "Frequency must be greater than the timeout",
      "The backup static route must have an AD lower than 1"
    ],
    answer: [1],
    explanation:
      "An IP SLA operation does not run until it is scheduled, for example ip sla schedule 1 life forever start-time now."
  },
  {
    id: "ipsla-2",
    domain: "Infrastructure Services",
    topic: "IP SLA",
    question:
      "Refer to the exhibit. What happens when 203.0.113.1 stops replying to pings?",
    exhibit:
`ip sla 1
 icmp-echo 203.0.113.1 source-interface GigabitEthernet0/1
 frequency 5
ip sla schedule 1 life forever start-time now
!
track 1 ip sla 1 reachability
!
ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 10`,
    options: [
      "Both default routes stay installed and load-balance",
      "The tracked route is removed, and the floating static route via 198.51.100.1 is installed",
      "The router removes both default routes",
      "The tracked route stays installed until Gi0/1 goes down"
    ],
    answer: [1],
    explanation:
      "When the track object goes down, the tracked static route is withdrawn from the RIB. The backup route (AD 10) then becomes the best default route."
  },
  {
    id: "netflow-1",
    domain: "Infrastructure Services",
    topic: "Flexible NetFlow",
    question: "In Flexible NetFlow, which component defines the key and non-key fields of a flow?",
    options: ["Flow exporter", "Flow monitor", "Flow record", "Flow sampler"],
    answer: [2],
    explanation:
      "The flow record defines the fields (match = key, collect = non-key). The exporter defines the collector destination, and the monitor ties a record and exporter together and is applied to an interface."
  },
  {
    id: "netflow-2",
    domain: "Infrastructure Services",
    topic: "Flexible NetFlow",
    question:
      "Refer to the exhibit. No flows are exported to the collector. What is missing?",
    exhibit:
`flow record REC
 match ipv4 source address
 match ipv4 destination address
 collect counter bytes
!
flow exporter EXP
 destination 10.9.9.9
 transport udp 2055
!
flow monitor MON
 record REC
!
interface GigabitEthernet0/0
 ip flow monitor MON input`,
    options: [
      "The exporter is not attached to the flow monitor",
      "The flow record must match the protocol field",
      "NetFlow must be applied in the output direction",
      "The collector must use UDP port 9996"
    ],
    answer: [0],
    explanation:
      "Flows are collected in the local cache, but the monitor has no exporter command (exporter EXP), so nothing is sent to the collector."
  },
  {
    id: "debug-1",
    domain: "Infrastructure Services",
    topic: "Troubleshooting Tools",
    question:
      "An engineer needs to see OSPF debug output only for GigabitEthernet0/2 on a busy router. Which command limits the output?",
    options: [
      "debug ip ospf adj | include Gi0/2",
      "debug condition interface GigabitEthernet0/2",
      "logging buffered debugging",
      "terminal monitor interface GigabitEthernet0/2"
    ],
    answer: [1],
    explanation:
      "Conditional debugging limits debug output to the given interface (or other conditions). Piping a debug command through include is not supported and would not reduce the CPU load anyway."
  },
  {
    id: "debug-2",
    domain: "Infrastructure Services",
    topic: "Troubleshooting Tools",
    question:
      "Which two actions are best practices before enabling a debug on a production router? (Choose two.)",
    options: [
      "Disable console logging and send output to the buffer",
      "Limit the debug scope with an ACL or condition",
      "Enable debug all to capture everything",
      "Disable CEF globally",
      "Increase the console speed to 9600"
    ],
    answer: [0, 1],
    explanation:
      "Console logging is CPU-intensive. Log to the buffer (or VTY with terminal monitor) and narrow the debug scope, for example with debug ip packet 100 detail or debug condition."
  },
  {
    id: "dnac-1",
    domain: "Infrastructure Services",
    topic: "Cisco DNA Center",
    question:
      "Which Cisco DNA Center Assurance tool shows the hop-by-hop path between two endpoints and highlights ACLs that block the traffic?",
    options: ["Network Time Travel", "Path Trace", "Command Runner", "Plug and Play"],
    answer: [1],
    explanation:
      "Path Trace calculates the path between a source and destination and shows the devices, interfaces and ACLs along the way. Network Time Travel shows historical health data."
  },
  {
    id: "dnac-2",
    domain: "Infrastructure Services",
    topic: "Cisco DNA Center",
    question: "Which Cisco DNA Center feature provides health scores for network devices, clients and applications?",
    options: ["Design", "Policy", "Provision", "Assurance"],
    answer: [3],
    explanation:
      "Assurance collects telemetry and provides health scores, issues and guided remediation for devices, clients and applications."
  },

  // ───────────────────────── Batch 2: focus topics ─────────────────────────

  // OSPF hello debug (R / C)
  {
    id: "ospf-9",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Refer to the exhibit. What do the R and C values in the debug output represent?",
    exhibit:
`R1# debug ip ospf hello
OSPF-1 HELLO Gi0/0: Mismatched hello parameters from 10.1.12.2
OSPF-1 HELLO Gi0/0: Dead R 120 C 40, Hello R 30 C 10 Mask R 255.255.255.0 C 255.255.255.0`,
    options: [
      "R = value Received in the neighbor's hello; C = value Configured on the local interface",
      "R = Remote router ID; C = Current DR",
      "R = Required value; C = Calculated value",
      "R = value on the Root (DR); C = value on the Client (DROTHER)"
    ],
    answer: [0],
    explanation:
      "R is the value received from the neighbor (10.1.12.2), and C is the value configured locally on R1's interface. Here the neighbor uses 30/120 (point-to-multipoint/NBMA defaults) and R1 uses 10/40 (broadcast/point-to-point defaults)."
  },
  {
    id: "ospf-10",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Refer to the exhibit. R1 and R2 are connected over an Ethernet segment using the default OSPF network type. Which action allows the adjacency to form?",
    exhibit:
`R1# debug ip ospf hello
OSPF-1 HELLO Gi0/0: Rcv hello from 2.2.2.2 area 0 10.1.12.2
OSPF-1 HELLO Gi0/0: Mismatched hello parameters from 10.1.12.2
OSPF-1 HELLO Gi0/0: Dead R 40 C 40, Hello R 10 C 10 Mask R 255.255.255.252 C 255.255.255.0`,
    options: [
      "Configure the same subnet mask on both interfaces; R1 uses /24 and R2 uses /30",
      "Change the hello interval on R2 to 10 seconds",
      "Change the dead interval on R1 to 40 seconds",
      "Configure ip ospf mtu-ignore on R1"
    ],
    answer: [0],
    explanation:
      "Timers match (R = C), but the masks do not. R2 (received) uses 255.255.255.252 and R1 (configured) uses 255.255.255.0. On broadcast networks, OSPF requires the subnet mask to match. Point-to-point networks do not check the mask."
  },
  {
    id: "ospf-11",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question:
      "Refer to the exhibit. Which command on R1 resolves the mismatch without changing R2?",
    exhibit:
`R1# debug ip ospf hello
OSPF-1 HELLO Gi0/0: Mismatched hello parameters from 10.1.12.2
OSPF-1 HELLO Gi0/0: Dead R 40 C 40, Hello R 10 C 5 Mask R 255.255.255.0 C 255.255.255.0`,
    options: [
      "ip ospf hello-interval 10 on R1 Gi0/0",
      "ip ospf hello-interval 5 on R1 Gi0/0",
      "ip ospf dead-interval 20 on R1 Gi0/0",
      "ip ospf network point-to-point on R1 Gi0/0"
    ],
    answer: [0],
    explanation:
      "C (configured on R1) shows hello 5, while R2 sends hello 10. Dead intervals already match (40). Set R1's hello back to 10."
  },

  // DHCP
  {
    id: "dhcp-4",
    domain: "Infrastructure Services",
    topic: "DHCP",
    question: "In a DHCP relay environment, what does the giaddr field stand for?",
    options: [
      "Gateway IP address: the IP address of the relay agent interface that received the client request",
      "Global interface address: the server's outgoing interface",
      "Granted IP address: the address being leased to the client",
      "Group IP address: the multicast group used by DHCP servers"
    ],
    answer: [0],
    explanation:
      "giaddr = Gateway IP Address. The relay agent (ip helper-address) writes the IP address of the interface on which it received the broadcast. The server selects the pool whose subnet contains giaddr and sends its reply to that address."
  },
  {
    id: "dhcp-5",
    domain: "Infrastructure Services",
    topic: "DHCP",
    question:
      "Refer to the exhibit. A client on VLAN 30 sends a DHCPDISCOVER. Which giaddr does R1 insert, and which pool does the server use?",
    exhibit:
`R1 (relay)
interface GigabitEthernet0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
 ip helper-address 10.0.0.10
interface GigabitEthernet0/1
 ip address 10.0.0.1 255.255.255.0

DHCP server 10.0.0.10
ip dhcp pool SERVERS
 network 10.0.0.0 255.255.255.0
ip dhcp pool VLAN30
 network 192.168.30.0 255.255.255.0
 default-router 192.168.30.1`,
    options: [
      "giaddr 192.168.30.1; pool VLAN30",
      "giaddr 10.0.0.1; pool SERVERS",
      "giaddr 10.0.0.1; pool VLAN30",
      "giaddr 0.0.0.0; pool SERVERS"
    ],
    answer: [0],
    explanation:
      "The relay sets giaddr to the receiving interface (Gi0/0.30 = 192.168.30.1), not the outgoing interface. That address falls inside the VLAN30 pool, so the client gets an address from 192.168.30.0/24."
  },
  {
    id: "dhcp-6",
    domain: "Infrastructure Services",
    topic: "DHCP",
    question: "Which DHCP header field carries the IP address that the server is offering to the client?",
    options: ["ciaddr", "yiaddr", "siaddr", "giaddr"],
    answer: [1],
    explanation:
      "ciaddr = client IP address (used when the client already has an address, for example when renewing), yiaddr = 'your' IP address (the address offered or assigned), siaddr = next server IP address, giaddr = gateway (relay agent) IP address."
  },

  // EIGRP seed metric
  {
    id: "eigrp-8",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "Which command correctly redistributes OSPF process 1 into classic-mode EIGRP AS 100 with a usable seed metric?",
    options: [
      "redistribute ospf 1 metric 10000 100 255 1 1500",
      "redistribute ospf 1 metric 20",
      "redistribute ospf 1 subnets",
      "redistribute ospf 1 metric-type 1"
    ],
    answer: [0],
    explanation:
      "The EIGRP seed metric is made of five values: bandwidth, delay, reliability, load and MTU. A single metric value, subnets, and metric-type are OSPF-style options and do not set an EIGRP composite metric."
  },
  {
    id: "eigrp-9",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "In the command default-metric 10000 100 255 1 1500 under router eigrp 100, what do the values represent, in order?",
    options: [
      "Bandwidth (kbps), delay (tens of microseconds), reliability (x/255), load (x/255), MTU (bytes)",
      "Delay (microseconds), bandwidth (Mbps), load, reliability, MTU",
      "Bandwidth (bps), delay (ms), reliability (%), load (%), hop count",
      "K1, K2, K3, K4, K5 weights"
    ],
    answer: [0],
    explanation:
      "Order: bandwidth in kbps (10000 = 10 Mbps), delay in tens of microseconds (100 = 1000 µs), reliability 0–255 (255 = 100%), load 1–255 (1 = minimal), MTU in bytes."
  },
  {
    id: "eigrp-10",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "When redistributed into EIGRP, which two route sources get a valid metric without a seed metric being configured? (Choose two.)",
    options: ["Connected networks", "Another EIGRP autonomous system", "OSPF", "RIP", "BGP"],
    answer: [0, 1],
    explanation:
      "Connected (and static) routes take their metric from the interface, and routes from another EIGRP AS keep their composite metric. Routes from other protocols such as OSPF, RIP and BGP get an infinite metric unless you set one with metric, default-metric or a route-map."
  },
  {
    id: "eigrp-11",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "Refer to the exhibit. Which seed metric is applied to the routes redistributed from RIP and from OSPF?",
    exhibit:
`router eigrp 100
 default-metric 100000 10 255 1 1500
 redistribute rip metric 1544 2000 255 1 1500
 redistribute ospf 1`,
    options: [
      "RIP routes use 1544 2000 255 1 1500; OSPF routes use 100000 10 255 1 1500",
      "Both use 100000 10 255 1 1500, because default-metric overrides per-protocol metrics",
      "Both use 1544 2000 255 1 1500",
      "OSPF routes are not redistributed because they have no metric keyword"
    ],
    answer: [0],
    explanation:
      "A metric on a redistribute statement takes precedence over default-metric. default-metric applies to every redistributed source that does not specify its own metric, here OSPF."
  },
  {
    id: "eigrp-12",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "In EIGRP named mode, where is the redistribute ospf 1 metric 10000 100 255 1 1500 command entered?",
    options: [
      "router eigrp NAME → address-family ipv4 unicast autonomous-system 100 → topology base",
      "router eigrp NAME → address-family ipv4 unicast autonomous-system 100 → af-interface default",
      "router eigrp NAME (global level)",
      "interface configuration mode"
    ],
    answer: [0],
    explanation:
      "In named mode, redistribution, default-metric, variance, maximum-paths and distribute-lists are configured under topology base. af-interface holds per-interface settings such as hello timers, authentication and summary-address."
  },

  // Traditional NetFlow
  {
    id: "netflow-3",
    domain: "Infrastructure Services",
    topic: "NetFlow",
    question: "Which interface command enables traditional NetFlow collection for traffic arriving on that interface?",
    options: ["ip flow ingress", "ip flow monitor MON input", "ip flow-export ingress", "netflow enable input"],
    answer: [0],
    explanation:
      "Traditional NetFlow uses ip flow ingress or ip flow egress on the interface. ip flow monitor ... input applies a Flexible NetFlow monitor."
  },
  {
    id: "netflow-4",
    domain: "Infrastructure Services",
    topic: "NetFlow",
    question:
      "Which two commands are required to collect traditional NetFlow on Gi0/0 and send it to a collector at 10.9.9.9 on UDP port 2055? (Choose two.)",
    options: [
      "ip flow-export destination 10.9.9.9 2055 (global)",
      "ip flow ingress (interface Gi0/0)",
      "flow exporter EXP (global)",
      "ip flow monitor EXP input (interface Gi0/0)",
      "snmp-server host 10.9.9.9 netflow"
    ],
    answer: [0, 1],
    explanation:
      "Traditional NetFlow needs flow collection on the interface (ip flow ingress/egress) and an export destination (ip flow-export destination <ip> <port>). Optional commands include ip flow-export version 9 and ip flow-export source Loopback0."
  },
  {
    id: "netflow-5",
    domain: "Infrastructure Services",
    topic: "NetFlow",
    question: "Which command displays the flow cache for traditional NetFlow?",
    options: ["show ip cache flow", "show flow monitor cache", "show ip flow export", "show netflow table"],
    answer: [0],
    explanation:
      "show ip cache flow shows the traditional NetFlow cache, and show ip flow export shows the export settings and statistics. For Flexible NetFlow, use show flow monitor NAME cache."
  },
  {
    id: "netflow-6",
    domain: "Infrastructure Services",
    topic: "NetFlow",
    question: "Which NetFlow export format is template-based and supports IPv6 and MPLS fields?",
    options: ["Version 1", "Version 5", "Version 7", "Version 9"],
    answer: [3],
    explanation:
      "NetFlow v9 (and IPFIX, which is based on it) uses templates, so it can carry any field, including IPv6 and MPLS labels. v5 has a fixed IPv4-only format."
  },

  // Flexible NetFlow
  {
    id: "fnf-1",
    domain: "Infrastructure Services",
    topic: "Flexible NetFlow",
    question: "Which command applies the Flexible NetFlow monitor MON to inbound IPv4 traffic on an interface?",
    options: ["ip flow monitor MON input", "flow monitor MON input", "ip flow ingress MON", "service-policy input MON"],
    answer: [0],
    explanation:
      "Syntax: ip flow monitor NAME {input | output} for IPv4, and ipv6 flow monitor NAME {input | output} for IPv6."
  },
  {
    id: "fnf-2",
    domain: "Infrastructure Services",
    topic: "Flexible NetFlow",
    question: "Which flow record command adds a non-key field?",
    options: [
      "collect counter packets",
      "match ipv4 source address",
      "match transport destination-port",
      "key counter bytes"
    ],
    answer: [0],
    explanation:
      "match defines key fields, which identify a unique flow. collect defines non-key fields, which are recorded per flow (counters, timestamps and so on)."
  },
  {
    id: "fnf-3",
    domain: "Infrastructure Services",
    topic: "Flexible NetFlow",
    question:
      "Refer to the exhibit. Which two statements about this exporter are true? (Choose two.)",
    exhibit:
`flow exporter EXP
 destination 10.9.9.9
 source Loopback0
 transport udp 2055
 export-protocol netflow-v9`,
    options: [
      "Export packets are sent to UDP port 2055",
      "Export packets use the IP address of Loopback0 as their source",
      "Export packets are sent over TCP",
      "The exporter uses IPFIX",
      "The exporter collects flows on Loopback0"
    ],
    answer: [0, 1],
    explanation:
      "destination = collector IP, source = interface used for the source IP, transport udp = collector port, export-protocol = format (netflow-v5, netflow-v9 or ipfix). An exporter only sends data. A monitor applied to an interface collects it."
  },
  {
    id: "fnf-4",
    domain: "Infrastructure Services",
    topic: "Flexible NetFlow",
    question: "Which command displays the flows currently stored in the Flexible NetFlow monitor MON?",
    options: ["show flow monitor MON cache", "show ip cache flow", "show flow record MON", "show flow exporter MON statistics"],
    answer: [0],
    explanation:
      "show flow monitor NAME cache displays the cache entries. show flow exporter [NAME] statistics shows export counters, and show flow interface shows which monitors are applied where."
  },
  {
    id: "fnf-5",
    domain: "Infrastructure Services",
    topic: "Flexible NetFlow",
    question:
      "An engineer wants a Flexible NetFlow monitor that captures the same fields as traditional NetFlow without building a custom record. Which command is used under the flow monitor?",
    options: [
      "record netflow ipv4 original-input",
      "record traditional",
      "record netflow-v5",
      "record default ipv4"
    ],
    answer: [0],
    explanation:
      "Flexible NetFlow ships predefined records. netflow ipv4 original-input emulates the traditional ingress NetFlow key fields."
  },
  {
    id: "fnf-6",
    domain: "Infrastructure Services",
    topic: "Flexible NetFlow",
    question:
      "Which is the correct dependency order when building a Flexible NetFlow configuration from scratch?",
    options: [
      "flow record → flow exporter → flow monitor (references the record and exporter) → apply the monitor to an interface",
      "flow monitor → flow record → apply the record to an interface → flow exporter",
      "flow exporter → apply the exporter to an interface → flow record",
      "flow sampler → flow record → apply the record to an interface"
    ],
    answer: [0],
    explanation:
      "The monitor ties everything together: under flow monitor you specify record NAME and exporter NAME. Only the monitor is applied to the interface, and samplers are optional."
  },
  {
    id: "fnf-7",
    domain: "Infrastructure Services",
    topic: "Flexible NetFlow",
    question: "Where is the active timeout for long-lived flows configured in Flexible NetFlow?",
    options: [
      "Under flow monitor with cache timeout active <seconds>",
      "Under flow record with collect timeout active",
      "Under flow exporter with template data timeout",
      "Under the interface with ip flow timeout"
    ],
    answer: [0],
    explanation:
      "The cache is part of the monitor: cache timeout active and cache timeout inactive set how often entries are flushed and exported. template data timeout under the exporter controls how often templates are resent."
  },

  // Summarization
  {
    id: "sum-1",
    domain: "Layer 3 Technologies",
    topic: "Summarization",
    question: "Which is the most specific summary route for networks 172.16.8.0/24 through 172.16.15.0/24?",
    options: ["172.16.8.0/21", "172.16.8.0/22", "172.16.0.0/20", "172.16.8.0/20"],
    answer: [0],
    explanation:
      "8 through 15 = 8 networks = 2³ → 3 bits borrowed from /24 → /21. The third octet 8 (00001000) is on a multiple-of-8 boundary, so 172.16.8.0/21 covers .8–.15 exactly."
  },
  {
    id: "sum-2",
    domain: "Layer 3 Technologies",
    topic: "Summarization",
    question:
      "Refer to the exhibit. R3 is an internal router in area 1. Routers in area 0 still see all four /24 routes. Why?",
    exhibit:
`R3# show running-config | section router ospf
router ospf 1
 network 10.1.0.0 0.0.3.255 area 1
 area 1 range 10.1.0.0 255.255.252.0`,
    options: [
      "area range only takes effect on an ABR, which creates the Type 3 summary LSA",
      "area range requires the advertise keyword",
      "The range must be configured with a wildcard mask",
      "OSPF cannot summarize area 1 routes"
    ],
    answer: [0],
    explanation:
      "Inter-area summarization happens on the ABR that generates the Type 3 LSAs. Configure area 1 range 10.1.0.0 255.255.252.0 on the ABR between area 1 and area 0."
  },
  {
    id: "sum-3",
    domain: "Layer 3 Technologies",
    topic: "Summarization",
    question:
      "Refer to the exhibit. Which two statements are true? (Choose two.)",
    exhibit:
`router bgp 65001
 network 10.1.1.0 mask 255.255.255.0
 network 10.1.2.0 mask 255.255.255.0
 aggregate-address 10.1.0.0 255.255.0.0 summary-only`,
    options: [
      "Only 10.1.0.0/16 is advertised to BGP peers",
      "The aggregate is created only if at least one more-specific component exists in the BGP table",
      "10.1.1.0/24 and 10.1.2.0/24 are advertised along with the aggregate",
      "The aggregate requires a static route to Null0",
      "summary-only adds the AS_SET attribute"
    ],
    answer: [0, 1],
    explanation:
      "aggregate-address creates the summary when at least one component prefix is in the BGP table. summary-only suppresses the more-specific routes. No Null0 route is needed (unlike the network command), and AS_SET is a separate keyword (as-set)."
  },
  {
    id: "sum-4",
    domain: "Layer 3 Technologies",
    topic: "Summarization",
    question: "What is the purpose of the as-set keyword on a BGP aggregate-address command?",
    options: [
      "It includes the AS numbers of the component routes in the aggregate to preserve loop prevention",
      "It suppresses the component routes",
      "It sets the aggregate's origin to IGP",
      "It sends the aggregate only to peers in the same AS"
    ],
    answer: [0],
    explanation:
      "Without as-set, the aggregate's AS_PATH starts at the aggregating router and loses the original AS information. as-set adds an unordered set of the component ASNs, so loop detection still works."
  },
  {
    id: "sum-5",
    domain: "Layer 3 Technologies",
    topic: "Summarization",
    question:
      "An engineer configures ip summary-address eigrp 100 10.1.0.0 255.255.0.0 on R1 Gi0/1, but wants 10.1.50.0/24 to also be advertised individually out that interface. Which feature achieves this?",
    options: [
      "A leak-map on the summary-address command",
      "The summary-only keyword",
      "A distribute-list out on Gi0/1",
      "eigrp stub summary"
    ],
    answer: [0],
    explanation:
      "ip summary-address eigrp 100 10.1.0.0 255.255.0.0 leak-map LEAK advertises the summary plus any component routes permitted by the route-map LEAK."
  },
  {
    id: "sum-6",
    domain: "Layer 3 Technologies",
    topic: "Summarization",
    question: "By default, which metric does an EIGRP summary route use?",
    options: [
      "The lowest metric of the component routes",
      "The highest metric of the component routes",
      "The average metric of the component routes",
      "A fixed metric of 1"
    ],
    answer: [0],
    explanation:
      "The summary inherits the best (lowest) metric among its components, so it may be recalculated when components change. In named mode, summary-metric can fix the value."
  },
  {
    id: "sum-7",
    domain: "Layer 3 Technologies",
    topic: "Summarization",
    question: "On an ABR, what is the effect of area 1 range 10.1.0.0 255.255.0.0 not-advertise?",
    options: [
      "Neither the summary nor the component routes in that range are advertised into other areas",
      "The summary is advertised but not the components",
      "The components are advertised but not the summary",
      "The range is advertised only into area 1"
    ],
    answer: [0],
    explanation:
      "not-advertise suppresses the Type 3 LSAs for the whole range, which effectively filters those intra-area routes from being advertised into other areas."
  },
  {
    id: "sum-8",
    domain: "Layer 3 Technologies",
    topic: "Summarization",
    question:
      "Which command summarizes routes on an OSPF ASBR that redistributes 192.168.0.0/24 through 192.168.3.0/24 from EIGRP?",
    options: [
      "summary-address 192.168.0.0 255.255.252.0",
      "area 0 range 192.168.0.0 255.255.252.0",
      "aggregate-address 192.168.0.0 255.255.252.0",
      "ip summary-address ospf 1 192.168.0.0 255.255.252.0"
    ],
    answer: [0],
    explanation:
      "External (Type 5/7) routes are summarized on the ASBR with summary-address under router ospf. Four networks (0–3) form a /22 = 255.255.252.0."
  },

  // Logging levels
  {
    id: "syslog-3",
    domain: "Infrastructure Services",
    topic: "Syslog",
    question: "Which syslog severity level is 'critical'?",
    options: ["1", "2", "3", "4"],
    answer: [1],
    explanation:
      "0 emergencies, 1 alerts, 2 critical, 3 errors, 4 warnings, 5 notifications, 6 informational, 7 debugging. A common mnemonic is 'Every Awesome Cisco Engineer Will Need Ice cream Daily'."
  },
  {
    id: "syslog-4",
    domain: "Infrastructure Services",
    topic: "Syslog",
    question: "A router has logging console errors configured. Which message is displayed on the console?",
    options: [
      "%LINK-3-UPDOWN: Interface GigabitEthernet0/1, changed state to down",
      "%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down",
      "%SYS-5-CONFIG_I: Configured from console by admin on vty0",
      "%OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on Gi0/0 from FULL to DOWN"
    ],
    answer: [0],
    explanation:
      "errors = level 3, so only levels 0–3 are shown. %LINK-3-UPDOWN is level 3. The others are level 5 (notifications)."
  },
  {
    id: "syslog-5",
    domain: "Infrastructure Services",
    topic: "Syslog",
    question: "What is the default severity level for messages sent to a syslog server (logging trap) on Cisco IOS?",
    options: ["Warnings (4)", "Notifications (5)", "Informational (6)", "Debugging (7)"],
    answer: [2],
    explanation:
      "By default, logging trap is informational, so levels 0–6 are sent to configured logging hosts. Debug messages (7) are not sent unless logging trap debugging is configured."
  },
  {
    id: "syslog-6",
    domain: "Infrastructure Services",
    topic: "Syslog",
    question:
      "An engineer connected via SSH enables debug ip ospf adj but sees no output. Logging to the monitor is enabled at the debugging level. Which command is missing?",
    options: ["terminal monitor", "logging console debugging", "logging buffered debugging", "service timestamps debug"],
    answer: [0],
    explanation:
      "Log and debug messages are sent to VTY sessions only after terminal monitor is entered in that session (with logging monitor at a level that includes 7)."
  },
  {
    id: "syslog-7",
    domain: "Infrastructure Services",
    topic: "Syslog",
    question: "Which two severity levels are more severe than warnings? (Choose two.)",
    options: ["Errors", "Critical", "Notifications", "Informational", "Debugging"],
    answer: [0, 1],
    explanation:
      "More severe means a lower number. Warnings is 4, so errors (3) and critical (2) are more severe. Notifications (5), informational (6) and debugging (7) are less severe."
  },
  {
    id: "syslog-8",
    domain: "Infrastructure Services",
    topic: "Syslog",
    question: "What is the result of logging buffered 64000 notifications?",
    options: [
      "Messages of levels 0–5 are stored in a 64000-byte local buffer",
      "Messages of level 5 only are stored in a 64000-byte buffer",
      "Up to 64000 messages of levels 5–7 are stored",
      "Messages of levels 0–5 are sent to the syslog server, and the buffer is cleared every 64000 seconds"
    ],
    answer: [0],
    explanation:
      "The number is the buffer size in bytes, and the level includes that severity and everything more severe. View the buffer with show logging."
  },

  // Policy-Based Routing
  {
    id: "pbr-3",
    domain: "Layer 3 Technologies",
    topic: "Policy-Based Routing",
    question:
      "A PBR route-map uses set ip default next-hop 10.2.2.2. When is this next hop used for matching packets?",
    options: [
      "Only when the routing table has no explicit route to the destination (the default route does not count)",
      "Always, before the routing table is consulted",
      "Only when the default route is missing",
      "Only for router-generated traffic"
    ],
    answer: [0],
    explanation:
      "set ip next-hop overrides the routing table. set ip default next-hop is used only when there is no explicit route for the destination, and a 0.0.0.0/0 route is not considered explicit."
  },
  {
    id: "pbr-4",
    domain: "Layer 3 Technologies",
    topic: "Policy-Based Routing",
    question:
      "Refer to the exhibit. What happens to traffic from 192.168.10.5 that arrives on Gi0/0?",
    exhibit:
`access-list 10 permit 192.168.10.0 0.0.0.255
!
route-map PBR deny 10
 match ip address 10
route-map PBR permit 20
 set ip next-hop 10.2.2.2
!
interface GigabitEthernet0/0
 ip policy route-map PBR`,
    options: [
      "It is forwarded normally using the routing table",
      "It is dropped",
      "It is sent to 10.2.2.2",
      "It is sent to Null0"
    ],
    answer: [0],
    explanation:
      "In PBR, a deny route-map entry (or no match) means the packet is not policy-routed. It is not dropped; it is forwarded by normal destination-based routing. All other traffic matches sequence 20 and is sent to 10.2.2.2."
  },
  {
    id: "pbr-5",
    domain: "Layer 3 Technologies",
    topic: "Policy-Based Routing",
    question: "Which two commands verify or troubleshoot PBR operation? (Choose two.)",
    options: ["show ip policy", "debug ip policy", "show ip pbr neighbors", "show policy-map interface", "debug ip routing"],
    answer: [0, 1],
    explanation:
      "show ip policy lists interfaces with a route-map applied. debug ip policy shows per-packet PBR decisions ('policy match', 'policy rejected -- normal forwarding'). show route-map shows match counters."
  },
  {
    id: "pbr-6",
    domain: "Layer 3 Technologies",
    topic: "Policy-Based Routing",
    question:
      "Refer to the exhibit. LAN users on Gi0/0 should reach the internet through ISP2 (10.2.2.2), but traffic still follows the default route through ISP1. What is wrong?",
    exhibit:
`access-list 101 permit ip 192.168.10.0 0.0.0.255 any
route-map TO-ISP2 permit 10
 match ip address 101
 set ip next-hop 10.2.2.2
!
interface GigabitEthernet0/0
 description LAN
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/1
 description ISP1
 ip policy route-map TO-ISP2`,
    options: [
      "The policy is applied to the ISP1 interface; it must be applied inbound on the LAN interface Gi0/0",
      "The ACL must match the destination instead of the source",
      "set ip next-hop requires the outgoing interface",
      "PBR requires CEF to be disabled"
    ],
    answer: [0],
    explanation:
      "ip policy route-map acts on packets as they enter an interface, so it must be applied on the ingress interface (Gi0/0 LAN), not on the exit interface."
  },
  {
    id: "pbr-7",
    domain: "Layer 3 Technologies",
    topic: "Policy-Based Routing",
    question: "What does set ip next-hop verify-availability 10.2.2.2 10 track 1 do in a PBR route-map?",
    options: [
      "It policy-routes to 10.2.2.2 only while track object 1 is up; otherwise the next entry or normal routing is used",
      "It pings 10.2.2.2 every 10 seconds",
      "It sets the administrative distance of the PBR path to 10",
      "It load-balances across 10 next hops"
    ],
    answer: [0],
    explanation:
      "verify-availability with track ties the PBR next hop to an object (often an IP SLA). 10 is the sequence number of the next-hop entry. If the track is down, the next hop is skipped."
  },

  // uRPF
  {
    id: "urpf-3",
    domain: "Infrastructure Security",
    topic: "uRPF",
    question: "Which interface command enables uRPF strict mode?",
    options: [
      "ip verify unicast source reachable-via rx",
      "ip verify unicast source reachable-via any",
      "ip verify source",
      "ip urpf strict"
    ],
    answer: [0],
    explanation:
      "rx = strict mode (the source must be reachable through the receiving interface). any = loose mode (the source must exist in the FIB through any interface). ip verify source is the DHCP-snooping IP Source Guard feature on switches."
  },
  {
    id: "urpf-4",
    domain: "Infrastructure Security",
    topic: "uRPF",
    question: "Which feature must be enabled for uRPF to work?",
    options: ["CEF", "NetFlow", "IP SLA", "Process switching"],
    answer: [0],
    explanation: "uRPF performs its reverse lookup in the CEF FIB, so CEF (ip cef) must be enabled."
  },
  {
    id: "urpf-5",
    domain: "Infrastructure Security",
    topic: "uRPF",
    question:
      "Refer to the exhibit. R1 receives a packet sourced from 10.5.5.10 on Gi0/1. What happens to it?",
    exhibit:
`R1# show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 ip verify unicast source reachable-via rx

R1# show ip route 10.5.5.10
Routing entry for 10.5.5.0/24
  Known via "ospf 1", distance 110, metric 3
  * 10.1.13.3, via GigabitEthernet0/2`,
    options: [
      "It is dropped, because the best path back to the source is not through Gi0/1",
      "It is forwarded, because a route to the source exists",
      "It is forwarded and logged",
      "It is dropped only if 10.5.5.10 is a private address"
    ],
    answer: [0],
    explanation:
      "Strict mode requires the best return route to point out the interface the packet arrived on. The route points to Gi0/2, so the check fails. Loose mode (reachable-via any) would forward the packet."
  },
  {
    id: "urpf-6",
    domain: "Infrastructure Security",
    topic: "uRPF",
    question:
      "uRPF is configured with ip verify unicast source reachable-via rx 120. What is the role of ACL 120?",
    options: [
      "It is checked only for packets that fail uRPF: permitted packets are forwarded anyway, denied packets are dropped",
      "It is checked before uRPF and bypasses the uRPF check for permitted packets",
      "It filters which interfaces uRPF runs on",
      "It defines which source prefixes are trusted for the routing table"
    ],
    answer: [0],
    explanation:
      "The optional ACL is evaluated only when the uRPF check fails. A permit lets the packet through (counted as a suppressed drop), and a deny drops it. A deny entry with the log keyword is useful for logging spoofed traffic."
  },
  {
    id: "urpf-7",
    domain: "Infrastructure Security",
    topic: "uRPF",
    question: "Refer to the exhibit. Which statement describes the uRPF configuration?",
    exhibit:
`R1# show ip interface GigabitEthernet0/0 | include verif
  IP verify source reachable-via RX, allow default
   1543 verification drops
   0 suppressed verification drops`,
    options: [
      "Strict mode, with the default route accepted as a valid match",
      "Loose mode, with the default route accepted as a valid match",
      "Strict mode, with an ACL permitting failed packets",
      "Loose mode, ignoring the default route"
    ],
    answer: [0],
    explanation:
      "RX = strict mode, and allow default means a source matched only by 0.0.0.0/0 still passes if the default route points out the receiving interface. Suppressed drops would increase if an ACL were permitting failed packets."
  },
  {
    id: "urpf-8",
    domain: "Infrastructure Security",
    topic: "uRPF",
    question: "Which command enables uRPF strict mode for IPv6 on an interface?",
    options: [
      "ipv6 verify unicast source reachable-via rx",
      "ip verify unicast source reachable-via rx ipv6",
      "ipv6 urpf strict",
      "ipv6 traffic-filter urpf in"
    ],
    answer: [0],
    explanation:
      "IPv6 uses the same model with the ipv6 prefix: ipv6 verify unicast source reachable-via {rx | any}. IPv6 CEF must be enabled."
  },

  // General extras
  {
    id: "bgp-10",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question: "A route is received with the well-known community no-export. What does the receiving router do?",
    options: [
      "It does not advertise the route to eBGP peers outside its AS (or confederation)",
      "It does not advertise the route to any peer",
      "It does not install the route in the routing table",
      "It advertises the route only to route-reflector clients"
    ],
    answer: [0],
    explanation:
      "no-export keeps the route inside the local AS (or confederation). no-advertise prevents advertising to any peer, and local-AS keeps the route inside the local sub-AS of a confederation."
  },
  {
    id: "bgp-11",
    domain: "Layer 3 Technologies",
    topic: "BGP",
    question:
      "An enterprise with two ISP links wants all outbound traffic to prefer ISP1, and wants every router in the AS to make the same decision. Which configuration achieves this?",
    options: [
      "An inbound route-map on the ISP1 session that sets local-preference 200",
      "An outbound route-map toward ISP1 that sets MED 200",
      "neighbor ISP1 weight 200 on one edge router",
      "AS-path prepending toward ISP1"
    ],
    answer: [0],
    explanation:
      "Local preference is shared with all iBGP peers and is evaluated early (after weight), so the whole AS exits through ISP1. Weight is local to one router, and MED and prepending influence inbound traffic."
  },
  {
    id: "mpls-7",
    domain: "VPN Technologies",
    topic: "MPLS",
    question: "Refer to the exhibit. What does 'Pop Label' indicate for 10.4.4.4/32?",
    exhibit:
`R3# show mpls forwarding-table 10.4.4.4
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
Label      Label      or Tunnel Id     Switched      interface
19         Pop Label  10.4.4.4/32      12840         Gi0/1      10.3.4.4`,
    options: [
      "R3 is the penultimate hop and removes the top label before forwarding to R4",
      "R3 drops labeled packets for this prefix",
      "R3 is the ingress LSR and imposes label 19",
      "R4 advertised explicit null"
    ],
    answer: [0],
    explanation:
      "R4 advertised implicit null (label 3) for its loopback, so R3 pops the label (PHP) and forwards the packet as plain IP. With explicit null, the outgoing label would show as explicit-n."
  },
  {
    id: "ipsla-3",
    domain: "Infrastructure Services",
    topic: "IP SLA",
    question:
      "An IP SLA udp-jitter operation toward a remote Cisco router returns no results. ICMP to that router works. What is required on the remote router?",
    options: ["ip sla responder", "ip sla schedule", "snmp-server enable traps rtr", "ip sla enable reaction-alerts"],
    answer: [0],
    explanation:
      "udp-jitter (and similar UDP/TCP operations) need the target to run the IP SLA responder so it can timestamp and reply. ICMP echo needs no responder."
  },
  {
    id: "snmp-3",
    domain: "Infrastructure Services",
    topic: "SNMP",
    question: "Which command creates an SNMPv3 user that uses authentication and encryption?",
    options: [
      "snmp-server user ADMIN NMS-GROUP v3 auth sha AuthPass123 priv aes 128 PrivPass123",
      "snmp-server community ADMIN v3 priv",
      "snmp-server user ADMIN NMS-GROUP v2c auth sha AuthPass123",
      "snmp-server group NMS-GROUP v3 auth"
    ],
    answer: [0],
    explanation:
      "SNMPv3 users are linked to a group and given auth (SHA/MD5) and priv (AES/DES) credentials. The group must be created with the priv security level (snmp-server group NMS-GROUP v3 priv)."
  },
  {
    id: "aaa-4",
    domain: "Infrastructure Security",
    topic: "AAA",
    question: "Which command sends a record of every privilege level 15 command entered to the TACACS+ server?",
    options: [
      "aaa accounting commands 15 default start-stop group tacacs+",
      "aaa authorization commands 15 default group tacacs+",
      "aaa accounting exec default start-stop group tacacs+",
      "logging host tacacs+ commands 15"
    ],
    answer: [0],
    explanation:
      "Command accounting logs the commands. Command authorization checks whether each command is allowed. Exec accounting records only session start and stop."
  },
  {
    id: "eigrp-13",
    domain: "Layer 3 Technologies",
    topic: "EIGRP",
    question:
      "An engineer needs to see EIGRP paths that do NOT meet the feasibility condition. Which command shows them?",
    options: [
      "show ip eigrp topology all-links",
      "show ip eigrp topology",
      "show ip eigrp neighbors detail",
      "show ip route eigrp"
    ],
    answer: [0],
    explanation:
      "show ip eigrp topology lists only successors and feasible successors. all-links also shows paths that fail the feasibility condition."
  },
  {
    id: "ospf-12",
    domain: "Layer 3 Technologies",
    topic: "OSPF",
    question: "Which router generates Type 3 summary LSAs?",
    options: ["ABR", "ASBR", "DR", "Any internal router"],
    answer: [0],
    explanation:
      "ABRs generate Type 3 LSAs to advertise networks between areas, and Type 4 LSAs to advertise ASBRs. ASBRs generate Type 5 (or Type 7 in an NSSA). The DR generates Type 2."
  }
];
