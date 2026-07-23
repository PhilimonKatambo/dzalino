import { BottleWine, DollarSign, GlassWater, Package, RadioIcon, ReplaceAll, Stamp, Sticker, User2Icon } from "lucide-react"
import "./calculations.css"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

const Calculations = () => {
    const [totalProduce, setTotalProduce] = useState(0)
    const [totalProduce2, setTotalProduce2] = useState(0)
    const [totalProduce3, setTotalProduce3] = useState(0)

    const produced = useSelector(
        (state) => state.expenses.produced
    );

    useEffect(() => {
        calculateTotalProduce();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [produced])

    const calculateTotalProduce = () => {
        let total = 0;
        let total2 = 0;
        let total3 = 0;

        produced.forEach(element => {
            if(element.Category==="Bigs_papers"){
                total = total + element.Qty;
            }else if(element.Category==="Bigs_cartons"){
                total2 = total2 + element.Qty;
            }else if(element.Category==="Nips"){
                total3 = total3 + element.Qty;
            }
        });

        setTotalProduce(total);
        setTotalProduce2(total2);
        setTotalProduce3(total3);
    }
    return (
        <div id="allExpense2" className="allExp">
            <BigPapers totalProduce={totalProduce} />
            <BigCartons totalProduce={totalProduce2} />
            <Nips totalProduce={totalProduce3} />
        </div>
    )
}


const BigPapers = (props) => {
    const [total, setTotal] = useState(0)
    const totalProduce = props.totalProduce

    const amount = 12
    const cls=1
    const rawMaterials = {
        Bottles: [350,amount],
        MRA_Stickers: [32,amount],
        Stickers: [250, amount],
        Rid: [100,amount],
        Labour: [25,amount],
        Ethanol: [730,amount],
        Carton: [0,cls],
        Other: [100,amount],
    }

    useEffect(() => {
        calculateTotal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalProduce])

    const calculateTotal = () => {
        let total1 = 0
        Object.values(rawMaterials).forEach((value) => {
            total1 = total1 = total1 + (Number(value[0]) * Number(value[1]))
        });
        setTotal(total1)
    }



    const Icons = {
        Bottles: <BottleWine size={15} />,
        MRA_Stickers: <Stamp size={15} />,
        Stickers: <Sticker size={15} />,
        Rid: <RadioIcon size={15} />,
        Labour: <User2Icon size={15} />,
        Ethanol: <GlassWater size={15} />,
        Carton:<Package size={15} />,
        Other: <ReplaceAll size={15} />
    }

    return (
        <div id="calcuLeft">
            <div id="calcuTt">Big papers:</div>
            <div id="calcuCont">
                {
                    Object.entries(rawMaterials).map(([key, value]) => (
                        <div id="raww" key={key}>
                            <div id="rawLeft">
                                {Icons[key]}
                                <div id="rawName">{key}:</div>
                            </div>
                            <div id="rawLeft">
                                <div id="eachP">K{Number(value[0]).toLocaleString()} x {Number(value[1]).toLocaleString()} = </div>
                                <div id="totall">K{Number(value[0]*value[1]).toLocaleString()}</div>
                            </div>
                        </div>
                    ))
                }

                <div id="raww">
                    <div id="rawLeft" style={{ fontWeight: "600" }}>
                        <DollarSign size={15} />
                        <div id="rawName" >Total:</div>
                    </div>
                    <div id="rawLeft" style={{ fontWeight: "600" }}>
                        <div id="eachP">x {amount} =</div>
                        <div id="totall">K{Number(total).toLocaleString()}</div>
                    </div>
                </div>

                <div id="calcuTt" style={{ marginTop: "20px", fontSize: ".9rem" }}>Total Expense X Total Produce:</div>
                <div id="raww" >
                    <div id="rawLeft" style={{ fontWeight: "bold" }}>
                        <DollarSign size={15} />
                        <div id="rawName" >{Number(total).toLocaleString()} x {Number(totalProduce).toLocaleString()}</div>
                    </div>
                    <div id="rawLeft" style={{ fontWeight: "bold" }}>
                        {/* <div id="eachP">x {amount} =</div> */}
                        <div id="totall" style={{ fontWeight: "900" }}>K{Number(total * totalProduce).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const BigCartons = (props) => {
    const [total, setTotal] = useState(0)
    const totalProduce = props.totalProduce

    const amount = 12
    const cls=1
    const rawMaterials = {
        Bottles: [350,amount],
        MRA_Stickers: [32,amount],
        Stickers: [250, amount],
        Rid: [100,amount],
        Labour: [25,amount],
        Ethanol: [730,amount],
        Carton: [100,cls],
        Other: [100,amount],
    }

    useEffect(() => {
        calculateTotal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalProduce])

    const calculateTotal = () => {
        let total1 = 0
        Object.values(rawMaterials).forEach((value) => {
            total1 = total1 + Number(value[0]) * Number(value[1])
        });
        setTotal(total1)
    }



    const Icons = {
        Bottles: <BottleWine size={15} />,
        MRA_Stickers: <Stamp size={15} />,
        Stickers: <Sticker size={15} />,
        Rid: <RadioIcon size={15} />,
        Labour: <User2Icon size={15} />,
        Ethanol: <GlassWater size={15} />,
        Carton: <Package size={15} />,
        Other: <ReplaceAll size={15} />
    }

    return (

        <div id="calcuLeft">
            <div id="calcuTt">Big Cartons:</div>
            <div id="calcuCont">
                {
                    Object.entries(rawMaterials).map(([key, value]) => (
                        <div id="raww" key={key}>
                            <div id="rawLeft">
                                {Icons[key]}
                                <div id="rawName">{key}:</div>
                            </div>
                            <div id="rawLeft">
                                <div id="eachP">K{Number(value[0]).toLocaleString()} x {Number(value[1]).toLocaleString()} = </div>
                                <div id="totall">K{Number(value[0]*value[1]).toLocaleString()}</div>
                            </div>
                        </div>
                    ))
                }

                <div id="raww">
                    <div id="rawLeft" style={{ fontWeight: "600" }}>
                        <DollarSign size={15} />
                        <div id="rawName" >Total:</div>
                    </div>
                    <div id="rawLeft" style={{ fontWeight: "600" }}>
                        <div id="eachP">x {amount} =</div>
                        <div id="totall">K{Number(total).toLocaleString()}</div>
                    </div>
                </div>

                <div id="calcuTt" style={{ marginTop: "20px", fontSize: ".9rem" }}>Total Expense X Total Produce:</div>
                <div id="raww" >
                    <div id="rawLeft" style={{ fontWeight: "bold" }}>
                        <DollarSign size={15} />
                        <div id="rawName" >{Number(total).toLocaleString()} x {Number(totalProduce).toLocaleString()}</div>
                    </div>
                    <div id="rawLeft" style={{ fontWeight: "bold" }}>
                        {/* <div id="eachP">x {amount} =</div> */}
                        <div id="totall" style={{ fontWeight: "900" }}>K{Number(total * totalProduce).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Nips = (props) => {
    const [total, setTotal] = useState(0)
    const totalProduce = props.totalProduce

    const amount = 24
    const cls=1
    const rawMaterials = {
        Bottles: [250,amount],
        MRA_Stickers: [32,amount],
        Stickers: [250, amount],
        Rid: [30,amount],
        Labour: [25,amount],
        Ethanol: [650,amount],
        Carton: [200,cls],
        Other: [100,amount],
    }

    useEffect(() => {
        calculateTotal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalProduce])

    const calculateTotal = () => {
        let total1 = 0
        Object.values(rawMaterials).forEach((value) => {
            total1 = total1 + Number(value[0]) * Number(value[1])
        });
        setTotal(total1)
    }



    const Icons = {
        Bottles: <BottleWine size={15} />,
        MRA_Stickers: <Stamp size={15} />,
        Stickers: <Sticker size={15} />,
        Rid: <RadioIcon size={15} />,
        Labour: <User2Icon size={15} />,
        Ethanol: <GlassWater size={15} />,
        Carton: <Package size={15} />,
        Other: <ReplaceAll size={15} />
    }

    return (

        <div id="calcuLeft">
            <div id="calcuTt">Nips:</div>
            <div id="calcuCont">
                {
                    Object.entries(rawMaterials).map(([key, value]) => (
                        <div id="raww" key={key}>
                            <div id="rawLeft">
                                {Icons[key]}
                                <div id="rawName">{key}:</div>
                            </div>
                            <div id="rawLeft">
                                <div id="eachP">K{Number(value[0]).toLocaleString()} x {Number(value[1]).toLocaleString()} = </div>
                                <div id="totall">K{Number(value[0]*value[1]).toLocaleString()}</div>
                            </div>
                        </div>
                    ))
                }

                <div id="raww">
                    <div id="rawLeft" style={{ fontWeight: "600" }}>
                        <DollarSign size={15} />
                        <div id="rawName" >Total:</div>
                    </div>
                    <div id="rawLeft" style={{ fontWeight: "600" }}>
                        <div id="eachP">x {amount} =</div>
                        <div id="totall">K{Number(total).toLocaleString()}</div>
                    </div>
                </div>

                <div id="calcuTt" style={{ marginTop: "20px", fontSize: ".9rem" }}>Total Expense X Total Produce:</div>
                <div id="raww" >
                    <div id="rawLeft" style={{ fontWeight: "bold" }}>
                        <DollarSign size={15} />
                        <div id="rawName" >{Number(total).toLocaleString()} x {Number(totalProduce).toLocaleString()}</div>
                    </div>
                    <div id="rawLeft" style={{ fontWeight: "bold" }}>
                        {/* <div id="eachP">x {amount} =</div> */}
                        <div id="totall" style={{ fontWeight: "900" }}>K{Number(total * totalProduce).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}



export default Calculations
