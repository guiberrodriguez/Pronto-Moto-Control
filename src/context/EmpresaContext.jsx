import React, { createContext, useContext, useState } from "react";

const EmpresaContext = createContext();

export function EmpresaProvider({children}){
  const [empresaActual,setEmpresaActual]=useState(null);

  return (
    <EmpresaContext.Provider
      value={{
        empresaActual,
        setEmpresaActual
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa(){
  return useContext(EmpresaContext);
}